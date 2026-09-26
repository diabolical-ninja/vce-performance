import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { MapCanvas } from "@/components/map-canvas";
import { MapExplorer } from "@/components/map-explorer";
import { MapList } from "@/components/map-list";
import { getRows } from "@/lib/data";
import { located, victoria } from "@/lib/map";

const mocks = vi.hoisted(
  (): {
    events: Record<string, () => void>;
    tileEvents: Record<string, () => void>;
    markers: (() => void)[];
    fail: boolean;
    remove: ReturnType<typeof vi.fn>;
    resize: () => void;
    disconnect: ReturnType<typeof vi.fn>;
    bounds: { north: number; south: number; east: number; west: number };
  } => ({
    events: {},
    tileEvents: {},
    markers: [],
    fail: false,
    remove: vi.fn(),
    resize: (): void => {},
    disconnect: vi.fn(),
    bounds: { north: -33.9, south: -39.2, west: 140.8, east: 150.1 },
  }),
);
vi.mock("leaflet", (): object => ({
  map: (): object => {
    if (mocks.fail) throw new Error("Map unavailable");
    return {
      fitBounds: (corners: number[][]): void => {
        mocks.bounds = {
          south: corners[0][0],
          west: corners[0][1],
          north: corners[1][0],
          east: corners[1][1],
        };
      },
      panInside: vi.fn(),
      invalidateSize: vi.fn(),
      on: (name: string, callback: () => void): void => {
        mocks.events[name] = callback;
      },
      remove: mocks.remove,
      getBounds: (): object => ({
        getNorth: (): number => mocks.bounds.north,
        getSouth: (): number => mocks.bounds.south,
        getWest: (): number => mocks.bounds.west,
        getEast: (): number => mocks.bounds.east,
      }),
    };
  },
  tileLayer: (): object => ({
    on: (name: string, callback: () => void): object => {
      mocks.tileEvents[name] = callback;
      return { addTo: vi.fn() };
    },
  }),
  circleMarker: (): object => ({
    addTo: (): object => ({
      setStyle: vi.fn(),
      bringToFront: vi.fn(),
      getLatLng: vi.fn(),
      bindTooltip: (): object => ({
        on: (_name: string, callback: () => void): void => {
          mocks.markers.push(callback);
        },
      }),
    }),
  }),
}));
beforeEach((): void => {
  mocks.fail = false;
  mocks.markers = [];
  mocks.remove.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        mocks.resize = callback;
      }
      observe(): void {}
      disconnect(): void {
        mocks.disconnect();
      }
    },
  );
});
const base = located(getRows())[0];
it("mounts the map, reacts to movement, tile failure, resize and point selection, and cleans up", async (): Promise<void> => {
  const move = vi.fn(),
    select = vi.fn(),
    failure = vi.fn();
  const { unmount } = render(
    <MapCanvas
      selected=""
      rows={[base]}
      measure="median"
      range={[0, 50]}
      viewport={victoria}
      onMove={move}
      onSelect={select}
      onFailure={failure}
    />,
  );
  await waitFor((): void => expect(mocks.markers).toHaveLength(1));
  act((): void => {
    mocks.bounds = { north: -36, south: -38, west: 144, east: 146 };
    mocks.events.moveend();
    mocks.markers[0]();
    mocks.tileEvents.tileerror();
    mocks.resize();
    Object.defineProperty(
      screen.getByLabelText("School locations map"),
      "clientWidth",
      { value: 800, configurable: true },
    );
    mocks.resize();
    mocks.events.unload();
  });
  expect(move).toHaveBeenCalledWith({
    north: -36,
    south: -38,
    west: 144,
    east: 146,
  });
  expect(select).toHaveBeenCalledWith(base.id);
  expect(failure).toHaveBeenCalledOnce();
  expect(mocks.disconnect).toHaveBeenCalled();
  unmount();
  expect(mocks.remove).toHaveBeenCalledOnce();
});
it("cancels a pending map import and reports initialization failures", async (): Promise<void> => {
  const failure = vi.fn();
  const props = {
    selected: "",
    rows: [base],
    measure: "median" as const,
    range: [0, 50] as [number, number],
    viewport: victoria,
    onMove: vi.fn(),
    onSelect: vi.fn(),
    onFailure: failure,
  };
  render(<MapCanvas {...props} />).unmount();
  await act(async (): Promise<void> => {
    await Promise.resolve();
  });
  expect(mocks.remove).not.toHaveBeenCalled();
  mocks.fail = true;
  render(<MapCanvas {...props} />);
  await waitFor((): void => expect(failure).toHaveBeenCalledOnce());
});
it("automatically synchronizes the visible area and supports map/list modes and a tile-free fallback", async (): Promise<void> => {
  render(
    <MapExplorer
      rows={[
        base,
        { ...base, id: "north", lat: -34, locality: "North" },
        { ...base, id: "missing", lat: null },
      ]}
      measure="median"
    />,
  );
  await waitFor((): void => expect(mocks.markers).toHaveLength(2));
  act((): void => {
    mocks.tileEvents.tileerror();
    mocks.bounds = { north: -36, south: -38, west: 144, east: 146 };
    mocks.events.moveend();
  });
  expect(screen.getByText(/Map tiles could not be loaded/)).toBeVisible();
  expect(screen.getByText(/1 located records/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Select school" }));
  expect(screen.getByText(/Selected:/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Show list" }));
  expect(screen.getByRole("button", { name: "Show map" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Show map" }));
  fireEvent.click(screen.getByRole("button", { name: "Show map and list" }));
  fireEvent.click(screen.getByRole("button", { name: "All Victoria" }));
  expect(screen.getByText(/2 located records/)).toBeVisible();
});
it("zooms to a known search and preserves a useful no-match state", async (): Promise<void> => {
  const searchArea = { north: -37, south: -38, west: 144, east: 146 };
  const { unmount } = render(
    <MapExplorer
      rows={[base]}
      measure="median"
      query="Fitzroy"
      searchArea={searchArea}
    />,
  );
  await waitFor((): void => expect(mocks.bounds).toEqual(searchArea));
  unmount();
  render(<MapExplorer rows={[base]} measure="median" query="zzznomatch" />);
  expect(screen.getByText(/No located suburb or school matches/)).toBeVisible();
});
it("keeps empty location searches usable", (): void => {
  render(<MapList rows={[]} selected="" measure="median" onSelect={vi.fn()} />);
  expect(screen.getByText(/No located schools/)).toBeVisible();
});
