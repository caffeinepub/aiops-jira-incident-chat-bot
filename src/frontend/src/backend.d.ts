import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Card {
    title: string;
    content: string;
    cardType: CardType;
    image: string;
    subtitle: string;
    header: string;
}
export enum CardType {
    faq = "faq",
    aiops = "aiops",
    help = "help",
    greeting = "greeting",
    incident = "incident",
    confirmation = "confirmation",
    project = "project"
}
export interface backendInterface {
    getGreetingCard(): Promise<Card>;
    getStaticAvatar(_userID: string): Promise<Uint8Array>;
}
