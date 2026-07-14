import type {SimulationLinkDatum, SimulationNodeDatum} from "d3-force";

export type GroupKey =
    | "base"
    | "internet"
    | "vcs"
    | "markup"
    | "pkg"
    | "js"
    | "tooling"
    | "webapi"
    | "perf"
    | "graphics"
    | "containers"
    | "bundlers"
    | "rendering"
    | "nextjs"
    | "react"
    | "typescript"
    | "architecture";

export interface SkillMeta {
    id: string;
    group: GroupKey;
}

export interface SkillNode extends SimulationNodeDatum, SkillMeta {
    label: string;
    desc: string;
}

export type SkillLink = SimulationLinkDatum<SkillNode>;

export type GroupColors = Record<GroupKey, string>;

export interface HoverState {
    node: SkillNode;
    x: number;
    y: number;
}
