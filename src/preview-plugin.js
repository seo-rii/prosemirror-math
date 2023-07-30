// preview

import {Plugin} from "prosemirror-state"
import {render, KatexOptions} from "katex";

//const PREVIEW_PLUGIN_KEY = new PluginKey<IMathPluginState>("prosemirror-math-preview");

export class PreviewTooltip {
    constructor(equation) {
        this.tooltip = document.createElement("div")
        this.tooltip.className = "tooltip"
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

        // Hide the tooltip if the selection is empty
        if (texString.length == 0) {
            this.tooltip.style.display = "none"
            return
        }

        // Otherwise, reposition it and update its content
        this.tooltip.style.display = ""
        //    let {from, to} = state.selection
        //    let start = view.coordsAtPos(from), end = view.coordsAtPos(to)
        let box = this.tooltip.offsetParent.getBoundingClientRect()
        this.tooltip.style.left = equation.coordsAtPos(0).left + "px" //start.left + "px"
        this.tooltip.style.bottom = (box.bottom - start.top) + "px"

        try {
            render(texString, this.tooltip, Object.assign({
                globalGroup: true,
                throwOnError: false
            }, options.katexOptions));
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