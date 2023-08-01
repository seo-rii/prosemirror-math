/*---------------------------------------------------------
 *  Author: Benjamin R. Bray
 *  License: MIT (see LICENSE in project root for details)
 *--------------------------------------------------------*/

// prosemirror imports
import {Schema, Node as ProseNode} from "prosemirror-model";
import {Plugin as ProsePlugin, PluginKey, PluginSpec} from "prosemirror-state";
import {MathView} from "./math-nodeview";
import {EditorView} from "prosemirror-view";

////////////////////////////////////////////////////////////

export interface IMathPluginState {
	macros: {
		[cmd: string]: string
	};
	/** A list of currently active `NodeView`s, in insertion order. */
	activeNodeViews: MathView[];
	/**
	 * Used to determine whether to place the cursor in the front- or back-most
	 * position when expanding a math node, without overriding the default arrow
	 * key behavior.
	 */
	prevCursorPos: number;
}

// uniquely identifies the prosemirror-math plugin
const MATH_ALL_PLUGIN_KEY = new PluginKey<IMathPluginState>("prosemirror");
const MATH_INLINE_PLUGIN_KEY = new PluginKey<IMathPluginState>("prosemirror-math-inline");
const MATH_DISPLAY_PLUGIN_KEY = new PluginKey<IMathPluginState>("prosemirror-math-display");

/**
 * Returns a function suitable for passing as a field in `EditorProps.nodeViews`.
 * @param displayMode TRUE for block math, FALSE for inline math.
 * @see https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews
 */
export function createMathView(displayMode: boolean, all = false) {
	return (node: ProseNode, view: EditorView, getPos: any): MathView => {
		const MATH_PLUGIN_KEY = all ? MATH_DISPLAY_PLUGIN_KEY : (displayMode ? MATH_DISPLAY_PLUGIN_KEY : MATH_INLINE_PLUGIN_KEY);
		/** @todo is this necessary?
		 * Docs says that for any function proprs, the current plugin instance
		 * will be bound to `this`.  However, the typings don't reflect this.
		 */
		let pluginState = MATH_PLUGIN_KEY.getState(view.state);
		if (!pluginState) {
			throw new Error("no math plugin!");
		}
		let nodeViews = pluginState.activeNodeViews;

		// set up NodeView
		let nodeView = new MathView(
			node, view, getPos as (() => number),
			{katexOptions: {displayMode, macros: pluginState.macros}},
			MATH_PLUGIN_KEY,
			() => {
				nodeViews.splice(nodeViews.indexOf(nodeView));
			},
		);

		nodeViews.push(nodeView);
		return nodeView;
	}
}


let mathInlinePluginSpec: PluginSpec<IMathPluginState> = {
	key: MATH_INLINE_PLUGIN_KEY,
	state: {
		init(config, instance) {
			return {
				macros: {},
				activeNodeViews: [],
				prevCursorPos: 0,
			};
		},
		apply(tr, value, oldState, newState) {
			// produce updated state field for this plugin
			return {
				// these values are left unchanged
				activeNodeViews: value.activeNodeViews,
				macros: value.macros,
				// update with the second-most recent cursor pos
				prevCursorPos: oldState.selection.from
			}
		},
		/** @todo (8/21/20) implement serialization for math plugin */
		// toJSON(value) { },
		// fromJSON(config, value, state){ return {}; }
	},
	props: {
		nodeViews: {
			"math_inline": createMathView(false)
		}
	}
};

let mathPluginSpec: PluginSpec<IMathPluginState> = {
	key: MATH_ALL_PLUGIN_KEY,
	state: {
		init(config, instance) {
			return {
				macros: {},
				activeNodeViews: [],
				prevCursorPos: 0,
			};
		},
		apply(tr, value, oldState, newState) {
			// produce updated state field for this plugin
			return {
				// these values are left unchanged
				activeNodeViews: value.activeNodeViews,
				macros: value.macros,
				// update with the second-most recent cursor pos
				prevCursorPos: oldState.selection.from
			}
		},
		/** @todo (8/21/20) implement serialization for math plugin */
		// toJSON(value) { },
		// fromJSON(config, value, state){ return {}; }
	},
	props: {
		nodeViews: {
			"math_inline": createMathView(false, true),
			"math_display": createMathView(true, true)
		}
	}
};

let mathDisplayPluginSpec: PluginSpec<IMathPluginState> = {
	key: MATH_DISPLAY_PLUGIN_KEY,
	state: {
		init(config, instance) {
			return {
				macros: {},
				activeNodeViews: [],
				prevCursorPos: 0,
			};
		},
		apply(tr, value, oldState, newState) {
			// produce updated state field for this plugin
			return {
				// these values are left unchanged
				activeNodeViews: value.activeNodeViews,
				macros: value.macros,
				// update with the second-most recent cursor pos
				prevCursorPos: oldState.selection.from
			}
		},
		/** @todo (8/21/20) implement serialization for math plugin */
		// toJSON(value) { },
		// fromJSON(config, value, state){ return {}; }
	},
	props: {
		nodeViews: {
			"math_display": createMathView(true)
		}
	}
};

export const mathInlinePlugin = new ProsePlugin(mathInlinePluginSpec);
export const mathDisplayPlugin = new ProsePlugin(mathDisplayPluginSpec);
export const mathPlugin = new ProsePlugin(mathPluginSpec);