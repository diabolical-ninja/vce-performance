import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from dash import Dash, Input, Output, callback, dcc, html
from dash_bootstrap_templates import load_figure_template

load_figure_template("bootstrap")

analysis_df = pd.read_csv("vce_school_results_analysis_dataset.csv")


app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.BOOTSTRAP],
    meta_tags=[
        {"name": "viewport", "content": "width=device-width, initial-scale=1"},
    ],
    title="School Comparison",
)

server = app.server


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
                                ["All"] + analysis_df["year"].unique().tolist(),
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
)

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

    statistic_over_time_fig.update_layout(
        legend=dict(yanchor="top", xanchor="left", y=1.1, orientation="h")
    )

    return statistic_over_time_fig


@callback(
    Output("top-n-schools", "figure"),
    Input("school-type", "value"),
    Input("result-year", "value"),
    Input("top-n-selection", "value"),
    Input("minimum-enrolments", "value"),
)
def update_top_n_schools(school_type, result_year, top_n, min_enrolments):
    if school_type is None:
        school_type = []

    if result_year == "All":
        result_year = analysis_df["year"].unique().tolist()
    else:
        result_year = [result_year]

    average_median_study_score = (
        analysis_df[analysis_df["year"].isin(result_year)]
        .groupby(["School", "School Sector", "School Type"])[
            ["Median VCE study score", "Total Enrolments"]
        ]
        .mean()
        .reset_index()
        .sort_values(ascending=False, by="Median VCE study score")
        .reset_index(drop=True)
    )

    average_median_study_score = average_median_study_score[
        average_median_study_score["Total Enrolments"] >= min_enrolments
    ]

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

    top_ranked_schools_fig.update_layout(
        legend=dict(yanchor="top", xanchor="left", y=1.1, orientation="h")
    )

    return top_ranked_schools_fig


if __name__ == "__main__":
    app.run(debug=True)
