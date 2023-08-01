/* eslint-disable */
import {Node, mergeAttributes} from '@tiptap/core';

import {inputRules} from 'prosemirror-inputrules';

import {
	makeBlockMathInputRule,
	makeInlineMathInputRule,
	REGEX_BLOCK_MATH_DOLLARS,
	REGEX_INLINE_MATH_DOLLARS
} from "./plugins/math-inputrules";
import {mathInlinePlugin, mathDisplayPlugin} from "./math-plugin";
import {mathBackspaceCmd} from "./plugins/math-backspace";
import {mathSelectPlugin} from "./plugins/math-select";
import {keymap} from "prosemirror-keymap";
import {chainCommands, deleteSelection, joinBackward, selectNodeBackward} from "prosemirror-commands";

export const MathInline = Node.create({
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

		return [mathInlinePlugin, inputRulePlugin, mathSelectPlugin, keymap({
			"Backspace": chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
		})];
	},
});

export const MathBlock = Node.create({
	name: 'math_display',
	group: 'block math',
	content: 'text*',
	atom: true,
	code: true,

	parseHTML() {
		return [{tag: 'math-display'}];
	},

	renderHTML({HTMLAttributes}) {
		return ['math-display', mergeAttributes({class: 'math-node'}, HTMLAttributes), 0];
	},

	addProseMirrorPlugins() {
		const inputRulePlugin = inputRules({
			rules: [makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, this.type)],
		});

		return [mathDisplayPlugin, inputRulePlugin];
	},
});