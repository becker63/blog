"use client";

import { setup, assign } from "xstate";

/**
 * Tree line position states for the blog tree visualization.
 * 
 * States:
 * - first: First item in list (line extends from center down)
 * - middle: Middle items (full vertical line)
 * - last: Last item (line extends from top to center)
 * - only: Single item (no vertical lines, just horizontal connector)
 */

// Types for context and events
export interface TreeLineContext {
    index: number;
    lastIndex: number;
    isChild: boolean;
    parentHasMoreItems: boolean; // Whether parent list continues after this child
}

export type TreeLineEvent =
    | { type: "SET_POSITION"; index: number; lastIndex: number; isChild: boolean; parentHasMoreItems: boolean };

// Output styles for each state
export interface TreeLineStyles {
    verticalHeight: string;
    translateY: string;
    showVerticalLine: boolean;
    showHorizontalLine: boolean;
}

/**
 * Compute line styles based on position in list
 */
export function getTreeLineStyles(context: TreeLineContext): TreeLineStyles {
    const { index, lastIndex, isChild, parentHasMoreItems } = context;

    // Single item - no vertical lines
    if (lastIndex === 0 && !isChild) {
        return {
            verticalHeight: "0",
            translateY: "0",
            showVerticalLine: false,
            showHorizontalLine: true,
        };
    }

    // First item (index 0)
    if (index === 0) {
        if (isChild) {
            // Child's first item - connects from parent level
            if (index === lastIndex) {
                // Only child
                return {
                    verticalHeight: "50%",
                    translateY: "-50%",
                    showVerticalLine: true,
                    showHorizontalLine: true,
                };
            }
            // First of multiple children
            return {
                verticalHeight: "calc(50% + 20px)",
                translateY: "0",
                showVerticalLine: true,
                showHorizontalLine: true,
            };
        }
        // Parent's first item - line from center downward
        return {
            verticalHeight: "50%",
            translateY: "100%",
            showVerticalLine: true,
            showHorizontalLine: true,
        };
    }

    // Last item
    if (index === lastIndex) {
        if (isChild) {
            // Last child
            return {
                verticalHeight: "50%",
                translateY: "0",
                showVerticalLine: true,
                showHorizontalLine: true,
            };
        }
        // Parent's last item - line from top to center
        return {
            verticalHeight: "50%",
            translateY: "0",
            showVerticalLine: true,
            showHorizontalLine: true,
        };
    }

    // Middle items - full height line
    return {
        verticalHeight: "100%",
        translateY: "0",
        showVerticalLine: true,
        showHorizontalLine: true,
    };
}

/**
 * State machine for tree line visualization
 */
export const treeLineMachine = setup({
    types: {
        context: {} as TreeLineContext,
        events: {} as TreeLineEvent,
    },
    actions: {
        setPosition: assign(({ event }) => {
            if (event.type !== "SET_POSITION") return {};
            return {
                index: event.index,
                lastIndex: event.lastIndex,
                isChild: event.isChild,
                parentHasMoreItems: event.parentHasMoreItems,
            };
        }),
    },
}).createMachine({
    id: "treeLine",
    initial: "idle",
    context: {
        index: 0,
        lastIndex: 0,
        isChild: false,
        parentHasMoreItems: false,
    },
    states: {
        idle: {
            on: {
                SET_POSITION: {
                    target: "positioned",
                    actions: "setPosition",
                },
            },
        },
        positioned: {
            on: {
                SET_POSITION: {
                    target: "positioned",
                    actions: "setPosition",
                },
            },
        },
    },
});

/**
 * Helper to determine position state from index
 */
export function getPositionState(index: number, lastIndex: number): "first" | "middle" | "last" | "only" {
    if (lastIndex === 0) return "only";
    if (index === 0) return "first";
    if (index === lastIndex) return "last";
    return "middle";
}
