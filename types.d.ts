import {AdditionalOperation, RulesLogic} from "json-logic-js";

interface PriorityOptions {
    conditionsTypeField: string,
    default: any
}

interface PriorityList {
    [key: string]: Array<PriorityOptions>
}

interface Variation {
    name: string;
    conditions: RulesLogic<AdditionalOperation> | any
}