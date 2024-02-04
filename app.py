"""Main dash app to display VCE result info."""
import os

import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from dash import Dash, Input, Output, callback, dcc, html
from dash_bootstrap_templates import load_figure_template

load_figure_template("bootstrap")
px.set_mapbox_access_token(os.getenv("MAPBOX_TOKEN"))

analysis_df = pd.read_csv("vce_school_results_analysis_dataset.csv")
analysis_df["School"].fillna("Not Yet Known", inplace=True)
analysis_df["School Sector"].fillna("Not Yet Known", inplace=True)
analysis_df["School Type"].fillna("Not Yet Known", inplace=True)


app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.BOOTSTRAP],
    meta_tags=[
        {"name": "viewport", "content": "width=device-width, initial-scale=1"},
    ],
    title="School Comparison",
)

server = app.server

navbar = dbc.Navbar(
    dbc.Container(
        [
            dbc.NavbarBrand("Historical VCE Performance", href="#"),
            dbc.Nav(
                [
                    dbc.NavItem(
                        dbc.Button(
                            [
                                html.Img(
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
                                    height="25px",
                                ),
                                "  View Source",
                            ],
                            href="https://github.com/diabolical-ninja/vce-performance",
                            target="_blank",
                            color="light",
                            className="mr-2",
                        )
                    )
                ],
                className="ml-auto",
                navbar=True,
            ),
        ]
    ),
    color="dark",
    dark=True,
    style={"margin-bottom": 20},
)

historical_school_performance_tab = html.Div(
    [
        html.Div(style={"margin-bottom": 20}),
        dcc.Dropdown(
            [
                "Median VCE study score",
                "Percentage of study scores of 40 and over",
                "Percentage of VCE students applying for tertiary places",
                "Percentage of satisfactory VCE completions",
                "ICSEA",
                "Total Enrolments",
            ],
            value="Median VCE study score",
            id="historical-performance-statistic-selection",
        ),
        dcc.Dropdown(
            analysis_df["School"].unique(),
            placeholder="Select a school",
            multi=True,
            id="school-selection",
        ),
        dcc.Graph(id="school-performance-over-time"),
    ]
)

top_schools_tab = html.Div(
    [
        dbc.Row(
            [
                dbc.Col(
                    dcc.Dropdown(
                        [
                            "Median VCE study score",
                            "Percentage of study scores of 40 and over",
                            "Percentage of VCE students applying for tertiary places",
                            "Percentage of satisfactory VCE completions",
                            "ICSEA",
                            # "Total Enrolments", # Currently causes a callback issue because it's being used for grouping as well
                        ],
                        value="Median VCE study score",
                        id="top-n-statistic-selection",
                    ),
                    width=5,
                ),
                dbc.Col(width=5),
            ],
            justify="around",
            style={"margin-top": 20},
        ),
        dbc.Row(
            [
                dbc.Col(
                    html.Div(
                        [
                            html.Label("School Type:"),
                            dcc.Dropdown(
                                ["Independent", "Government", "Catholic"],
                                multi=True,
                                value=["Independent", "Government", "Catholic"],
                                id="school-type",
                            ),
                        ],
                        style={"margin-bottom": 20},
                    ),
                    width=5,
                ),
                dbc.Col(
                    html.Div(
                        [
                            html.Label("Results Year:"),
                            dcc.Dropdown(
                                ["All"]
                                + sorted(
                                    analysis_df["year"].unique().tolist(), reverse=True
                                ),
                                value="All",
                                id="result-year",
                            ),
                        ],
                        style={"margin-bottom": 20},
                    ),
                    width=5,
                ),
            ],
            justify="around",
            style={"margin-top": 20},
        ),
        dbc.Row(
            [
                dbc.Col(
                    html.Div(
                        [
                            html.Label("Top N Schools:"),
                            dcc.Slider(
                                min=0,
                                max=50,
                                value=10,
                                step=1,
                                marks={i: str(i) for i in range(0, 51, 5)},
                                id="top-n-selection",
                            ),
                        ],
                        style={"margin-bottom": 20},
                    ),
                    width=5,
                ),
                dbc.Col(
                    html.Div(
                        [
                            html.Label(
                                "Minimum School Enrollment:",
                                style={"margin-right": 8},
                            ),
                            dcc.Input(
                                placeholder="Minimum school entrollment...",
                                type="number",
                                value=50,
                                id="minimum-enrolments",
                            ),
                        ],
                        style={"margin-bottom": 20},
                    ),
                    width=5,
                ),
            ],
            justify="around",
        ),
        dcc.Graph(
            id="top-n-schools",
        ),
    ]
)

schools_map_tab = html.Div(
    [
        dbc.Row(
            [
                dbc.Col(
                    dcc.Dropdown(
                        [
                            "Median VCE study score",
                            "Percentage of study scores of 40 and over",
                            "Percentage of VCE students applying for tertiary places",
                            "Percentage of satisfactory VCE completions",
                            "ICSEA",
                            "Total Enrolments",  # Currently causes a callback issue because it's being used for grouping as well
                        ],
                        value="Median VCE study score",
                        id="schools-map-statistic-selection",
                    ),
                    width=5,
                ),
                dbc.Col(width=5),
            ],
            justify="around",
            style={"margin-top": 20},
        ),
        dbc.Row(
            [
                dbc.Col(
                    html.Div(
                        [
                            html.Label("School Type:"),
                            dcc.Dropdown(
                                ["Independent", "Government", "Catholic"],
                                multi=True,
                                value=["Independent", "Government", "Catholic"],
                                id="school-map-school-type",
                            ),
                        ],
                        style={"margin-bottom": 0},
                    ),
                    width=5,
                ),
                dbc.Col(
                    html.Div(
                        [
                            html.Label("Results Year:"),
                            dcc.Dropdown(
                                sorted(
                                    analysis_df["year"].unique().tolist(), reverse=True
                                )[1:],
                                value=2022,
                                id="result-year-no-2023",
                            ),
                        ],
                        style={"margin-bottom": 0},
                    ),
                    width=5,
                ),
            ],
            justify="around",
            style={"margin-top": 20},
        ),
        dcc.Graph(
            id="schools-map",
        ),
    ]
)

about_tab = html.Div(
    [
        dcc.Markdown(
            """
            Inspirsed by The Age's schools that excel but with the ability to compare schools and rank them.

            ### Data Sources
            Data comes from two locations:    
            1. VCE results from VCAA [Senior secondary completion and achievement information](https://www.vcaa.vic.edu.au/administration/research-and-statistics/Pages/SeniorSecondaryCompletion.aspx)    
            2. [School profile](https://acara.edu.au/contact-us/acara-data-access) data is sourced from ACARA. This provides school sector (public, independent, catholic), ICSEA, etc.    
            """
        ),
    ],
    style={"margin-top": 20},
)


app.layout = dbc.Container(
    [
        navbar,
        dbc.Tabs(
            [
                dbc.Tab(
                    historical_school_performance_tab,
                    label="Historical School Performance",
                    tab_id="historical-school-performance",
                ),
                dbc.Tab(top_schools_tab, label="Top Schools", tab_id="top-schools"),
                dbc.Tab(schools_map_tab, label="Schools Map", tab_id="tab-schools-map"),
                dbc.Tab(about_tab, label="About", tab_id="about"),
            ],
            id="tabs",
            active_tab="historical-school-performance",
        ),
        html.Div(id="tab-content", className="p-4"),
    ]
)


@callback(
    Output("school-performance-over-time", "figure"),
    Input("historical-performance-statistic-selection", "value"),
    Input("school-selection", "value"),
)
def update_school_performance_over_time(statistic_to_plot, schools):
    if schools is None:
        schools = []

    statistic_over_time_fig = px.line(
        analysis_df[analysis_df["School"].isin(schools)].sort_values(
            by="year", ascending=True
        ),
        x="year",
        y=statistic_to_plot,
        hover_data=[
            "Locality",
            "Median VCE study score",
            "Percentage of study scores of 40 and over",
            "Percentage of VCE students applying for tertiary places",
            "Percentage of satisfactory VCE completions",
            "ICSEA",
            "School Sector",
            "School Type",
            "Total Enrolments",
        ],
        markers=True,
        color="School",
        title=statistic_to_plot,
    )

    statistic_over_time_fig.update_layout(
        xaxis=dict(
            range=[analysis_df["year"].min(), analysis_df["year"].max()], dtick=1
        ),
    )

    statistic_over_time_fig.update_layout(
        legend=dict(yanchor="top", xanchor="left", y=1.1, orientation="h")
    )

    return statistic_over_time_fig


@callback(
    Output("top-n-schools", "figure"),
    Input("top-n-statistic-selection", "value"),
    Input("school-type", "value"),
    Input("result-year", "value"),
    Input("top-n-selection", "value"),
    Input("minimum-enrolments", "value"),
)
def update_top_n_schools(
    top_n_statistic, school_type, result_year, top_n, min_enrolments
):
    if school_type is None:
        school_type = []
    else:
        school_type.append("Not Yet Known")

    if result_year == "All":
        result_year = analysis_df["year"].unique().tolist()
    else:
        result_year = [result_year]

    average_median_study_score = (
        analysis_df[analysis_df["year"].isin(result_year)]
        .groupby(["School", "School Sector", "School Type"])[
            [top_n_statistic, "Total Enrolments"]
        ]
        .mean()
        .reset_index()
        .sort_values(ascending=False, by=top_n_statistic)
        .reset_index(drop=True)
    )

    if average_median_study_score["Total Enrolments"].sum() != 0:
        average_median_study_score = average_median_study_score[
            average_median_study_score["Total Enrolments"] >= min_enrolments
        ]

    top_n_schools = (
        average_median_study_score[
            average_median_study_score["School Sector"].isin(school_type)
        ]
        .head(top_n)
        .sort_values(ascending=True, by=top_n_statistic)
    )

    spacer = 0.5
    x_min = top_n_schools[top_n_statistic].min() - spacer
    x_max = top_n_schools[top_n_statistic].max() + spacer

    color_discrete_map = {
        "Independent": "#636EFA",
        "Government": "#00CC96",
        "Catholic": "#EF553B",
    }

    top_ranked_schools_fig = px.bar(
        top_n_schools,
        y="School",
        x=top_n_statistic,
        color="School Sector",
        orientation="h",
        hover_data=[
            "School Sector",
            "School Type",
        ],
        color_discrete_map=color_discrete_map,
        title=f"Top {top_n} Schools",
    )

    calculated_height = max(450, 35 * top_n)
    top_ranked_schools_fig.update_layout(
        xaxis=dict(range=[x_min, x_max], dtick=0.5),
        yaxis=dict(
            categoryorder="array",
            categoryarray=top_n_schools["School"],
            tickvals=list(range(len(top_n_schools))),
            ticktext=top_n_schools["School"].tolist(),
        ),
        height=calculated_height,
    )

    top_ranked_schools_fig.update_layout(
        legend=dict(yanchor="top", xanchor="left", y=1.1, orientation="h")
    )

    return top_ranked_schools_fig


@callback(
    Output("schools-map", "figure"),
    Input("schools-map-statistic-selection", "value"),
    Input("school-map-school-type", "value"),
    Input("result-year-no-2023", "value"),
)
def update_schools_map(statistic_selection, school_type, results_year):
    if school_type is None:
        school_type = []

    plot_df = analysis_df[
        (analysis_df["year"] == results_year)
        & (analysis_df["School Sector"].isin(school_type))
    ]
    plot_df = plot_df[~plot_df[statistic_selection].isna()]

    schools_map_fig = px.scatter_mapbox(
        plot_df,
        lat="Latitude",
        lon="Longitude",
        color=statistic_selection,
        opacity=1.0,
        size=statistic_selection,
        size_max=7,
        zoom=9,
        height=550,
        center=dict(lat=-37.8136, lon=144.9631),
        color_continuous_scale="Jet",
        hover_data={
            "School": True,
            "School Sector": True,
            "Latitude": False,
            "Longitude": False,
        },
    )

    schools_map_fig.update_layout(margin=dict(l=30, r=30, t=60, b=30))

    return schools_map_fig


if __name__ == "__main__":
    app.run(debug=True)
