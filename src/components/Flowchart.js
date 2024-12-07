import React from "react";
import TikzRenderer from "./TikzRenderer";
import "./ComponentStyles.css";

const Flowchart = () => {
    const tikzCode = `
\\documentclass[tikz,border=10pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{shapes.geometric,arrows,positioning}

\\begin{document}
\\begin{tikzpicture}[
    auto,
    node distance=2cm,
    thick,
    phase/.style={
        rectangle,
        rounded corners,
        draw=black,
        fill=blue!20,
        text centered,
        minimum height=1cm,
        minimum width=3cm
    },
    decision/.style={
        diamond,
        draw=black,
        fill=yellow!20,
        text centered,
        minimum width=3cm,
        minimum height=1cm
    },
    artifact/.style={
        rectangle,
        draw=black,
        fill=green!20,
        text centered,
        minimum width=2.5cm,
        minimum height=0.8cm
    },
    note/.style={
        rectangle,
        draw=black,
        dashed,
        text width=2.5cm,
        minimum height=0.8cm
    },
    line/.style={draw, -latex}
]

% Nodes
\\node[phase] (plan) {Sprint Planning};
\\node[phase] (dev) [below=of plan] {Development};
\\node[decision] (test) [below=of dev] {Testing};
\\node[phase] (review) [below=of test] {Review};
\\node[phase] (retro) [below=of review] {Retrospective};

% Artifacts
\\node[artifact] (backlog) [right=2cm of plan] {Backlog};
\\node[artifact] (code) [right=2cm of dev] {Code};
\\node[artifact] (report) [right=2cm of test] {Reports};

% Arrows
\\path[line] (plan) -- (dev);
\\path[line] (dev) -- (test);
\\path[line] (test) -- (review);
\\path[line] (review) -- (retro);
\\path[line] (retro.west) to[bend left=45] (plan.west);
\\path[line] (test.east) to[bend left=45] (dev.east);

\\end{tikzpicture}
\\end{document}
`;

    return (
        <div className="flowchart-section">
            <h2 className="section-title">Sample Agile Sprint Flowchart</h2>
            <div className="preview-area">
                <TikzRenderer tikzCode={tikzCode} />
            </div>
        </div>
    );
};

export default Flowchart;
