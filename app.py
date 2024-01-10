import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from dash import Dash, Input, Output, callback, dcc, html
from dash_bootstrap_templates import load_figure_template

load_figure_template("bootstrap")

analysis_df = pd.read_csv("vce_school_results_analysis_dataset.csv")
average_median_study_score = (
    analysis_df.groupby(["School", "School Sector", "School Type"])[
        "Median VCE study score"
    ]
    .mean()
    .reset_index()
    .sort_values(ascending=False, by="Median VCE study score")
    .reset_index(drop=True)
)

app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    meta_tags=[
        {"name": "viewport", "content": "width=device-width, initial-scale=1"},
    ],
    title="School Comparison",
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
            id="statistic-selection",
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
        html.P(
            "Determined by the average of the median study score for all available years between 2014 and 2023",
            style={"margin-top": 20, "margin-bottom": 20},
        ),
        dcc.Dropdown(
            ["Independent", "Government", "Catholic"],
            multi=True,
            value=["Independent", "Government", "Catholic"],
            id="school-type",
        ),
        dcc.Slider(
            min=0,
            max=50,
            value=10,
            step=1,
            marks={i: str(i) for i in range(0, 51, 5)},
            id="top-n-selection",
        ),
        dcc.Graph(
            id="top-n-schools",
        ),
    ]
)

app.layout = dbc.Container(
    [
        html.H1(children="Schools That Excel-Ish"),
        dbc.Tabs(
            [
                dbc.Tab(
                    historical_school_performance_tab,
                    label="Historical School Performance",
                    tab_id="historical-school-performance",
                ),
                dbc.Tab(top_schools_tab, label="Top Schools", tab_id="top-schools"),
            ],
            id="tabs",
            active_tab="historical-school-performance",
        ),
        html.Div(id="tab-content", className="p-4"),
    ]
)


@callback(
    Output("school-performance-over-time", "figure"),
    Input("statistic-selection", "value"),
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

    return statistic_over_time_fig


@callback(
    Output("top-n-schools", "figure"),
    Input("school-type", "value"),
    Input("top-n-selection", "value"),
)
def update_top_n_schools(school_type, top_n):
    if school_type is None:
        school_type = []

    top_n_schools = (
        average_median_study_score[
            average_median_study_score["School Sector"].isin(school_type)
        ]
        .head(top_n)
        .sort_values(ascending=True, by="Median VCE study score")
    )

    spacer = 0.5
    x_min = top_n_schools["Median VCE study score"].min() - spacer
    x_max = top_n_schools["Median VCE study score"].max() + spacer

    color_discrete_map = {
        "Independent": "#636EFA",
        "Government": "#00CC96",
        "Catholic": "#EF553B",
    }

    top_ranked_schools_fig = px.bar(
        top_n_schools,
        y="School",
        x="Median VCE study score",
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

    return top_ranked_schools_fig


if __name__ == "__main__":
    app.run(debug=True)
