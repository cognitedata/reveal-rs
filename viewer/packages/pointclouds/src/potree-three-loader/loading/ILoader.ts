export type ILoader = {
  load(node: any): Promise<void>;

  parse(node: any, data: ArrayBuffer): void;
};
