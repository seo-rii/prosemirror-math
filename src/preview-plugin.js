// preview

import {Plugin} from "prosemirror-state"
import {render, KatexOptions} from "katex";

//const PREVIEW_PLUGIN_KEY = new PluginKey<IMathPluginState>("prosemirror-math-preview");

export class PreviewTooltip {
    constructor(equation) {
        this.tooltip = document.createElement("div")
        this.tooltip.className = "prosemirror-math-tooltip"
        equation.dom.parentNode.appendChild(this.tooltip)

        this.update(equation, null)
    }

    update(equation, lastState) {
        let state = equation.state
        // Don't do anything if the document/selection didn't change
        if (lastState && lastState.doc.eq(state.doc) &&
            lastState.selection.eq(state.selection)) return

        let content = equation?.docView?.node?.content?.content || [];
        let texString = "";
        if (content.length > 0 && content[0].textContent !== null) {
            texString = content[0].textContent.trim();
        }

        if (texString.length === 0) {
            this.tooltip.style.display = "none"
            return
        }

        try {
            this.tooltip.style.display = ""
            let box = this.tooltip.offsetParent?.getBoundingClientRect?.() || {left: 0, top: 0}
            this.tooltip.style.right = (box.left - equation.coordsAtPos(0).left) + "px"
            this.tooltip.style.top = (box.top - equation.coordsAtPos(0).bottom + 2) + "px"
        } catch (e) {
            return
        }

        try {
            render(texString, this.tooltip, Object.assign({
                globalGroup: true,
                throwOnError: false
            }, {}));
        } catch (err) {
            this.tooltip.textContent = "ERROR"
        }
    }

    destroy() {
        this.tooltip.remove()
    }
}

export const PreviewPlugin = new Plugin({
    view(editorView) {
        return new PreviewTooltip(editorView)
    }
})