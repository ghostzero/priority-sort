import jsonLogic from "json-logic-js";
import variationsJson from './variations.json';
import {Variation, PriorityList} from "./types";

class VariationSorter {
    /**
     * Returns the value of the condition for the given variable (null if not found)
     */
    getConditionValue(conditions: any, variable: string): { operator: string, value: any } {
        return conditions.and.map((condition: any) => {
            const operator = Object.keys(condition)[0];
            const variableName = condition[operator][0].var;
            const value = condition[operator][1];

            if (variableName === variable) {
                return {
                    operator,
                    value
                }
            }
        }).filter(Boolean)[0] || null;
    }

    /**
     * Returns the distance from the current value to the value of the condition
     */
    distanceFromCurrentValue(item: { operator: string, value: any }, currentValue: number) {
        if (item.operator === '>') {
            return currentValue - item.value;
        } else if (item.operator === '>=') {
            return currentValue - item.value;
        } else if (item.operator === '<') {
            return item.value - currentValue;
        } else if (item.operator === '<=') {
            return item.value - currentValue;
        } else if (item.operator === '==') {
            return Math.abs(currentValue - item.value);
        } else if (item.operator === '!=') {
            return Math.abs(currentValue - item.value);
        }

        return 0;
    }

    /**
     * Returns the best variation for the given data
     */
    sortBestVariations(alertVariations: Variation[], priorityList: PriorityList, data: any): void {
        const type = data.type;

        if (priorityList[type]) {
            const priority = priorityList[type];

            alertVariations.sort((a, b) => {
                let aDistance = 0;
                let bDistance = 0;

                priority.forEach((priorityItem) => {
                    const aConditionValue = this.getConditionValue(a.conditions, priorityItem.conditionsTypeField);
                    const bConditionValue = this.getConditionValue(b.conditions, priorityItem.conditionsTypeField);

                    if (aConditionValue) {
                        aDistance += this.distanceFromCurrentValue(aConditionValue, data[priorityItem.conditionsTypeField]);
                    } else {
                        aDistance += this.distanceFromCurrentValue({
                            operator: '==',
                            value: priorityItem.default
                        }, data[priorityItem.conditionsTypeField]);
                    }

                    if (bConditionValue) {
                        bDistance += this.distanceFromCurrentValue(bConditionValue, data[priorityItem.conditionsTypeField]);
                    } else {
                        bDistance += this.distanceFromCurrentValue({
                            operator: '==',
                            value: priorityItem.default
                        }, data[priorityItem.conditionsTypeField]);
                    }
                });

                return aDistance - bDistance;
            });
        }
    }
}

/**
 * Priority list for sorting variations
 */
const priorityList: PriorityList = {
    cheer: [
        {conditionsTypeField: 'amount', default: 0},
        {conditionsTypeField: 'supercheer', default: false},
    ],
    gift_subscribe: [
        {conditionsTypeField: 'amount', default: 0},
        {conditionsTypeField: 'tier', default: 1000},
        {conditionsTypeField: 'is_anonymous', default: false},
    ]
}

const data = {
    type: 'cheer',
    enabled: true,
    amount: 899,
    supercheer: true,
};

let variations: Variation[] = variationsJson;
variations = variations.filter(variation => jsonLogic.apply(variation.conditions, data));

console.log('unsorted', variations)

const variationSorter = new VariationSorter()
variationSorter.sortBestVariations(variations, priorityList, data)

console.log('sorted', variations)
