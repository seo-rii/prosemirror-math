/* eslint-disable */
import {Node, mergeAttributes} from '@tiptap/core';

import {inputRules} from 'prosemirror-inputrules';

import {
	makeBlockMathInputRule,
	makeInlineMathInputRule,
	REGEX_BLOCK_MATH_DOLLARS,
	REGEX_INLINE_MATH_DOLLARS
} from "./plugins/math-inputrules";
import {mathPlugin} from "./math-plugin";
import {mathBackspaceCmd} from "./plugins/math-backspace";
import {mathSelectPlugin} from "./plugins/math-select";
import {keymap} from "prosemirror-keymap";
import {chainCommands, deleteSelection, joinBackward, selectNodeBackward} from "prosemirror-commands";

export const Katex = Node.create({
	name: 'math_inline',
	group: 'inline math',
	content: 'text*',
	inline: true,
	atom: true,
	code: true,

	parseHTML() {
		return [{tag: 'math-inline'}];
	},

	renderHTML({HTMLAttributes}) {
		return ['math-inline', mergeAttributes(HTMLAttributes), 0];
	},

	addProseMirrorPlugins() {
		const inputRulePlugin = inputRules({
			rules: [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, this.type), makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, this.type)],
		});

		return [mathPlugin, inputRulePlugin, mathSelectPlugin, keymap({
			"Backspace": chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
		}),];
	},
});