import {
	MarkdownPostProcessor,
	MarkdownPostProcessorContext,
	Plugin,
} from "obsidian";

// Remember to rename these classes and interfaces!

export default class DiceStat extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor(this.diceStatProcessor);
	}

	diceStatProcessor: MarkdownPostProcessor = (
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	) => {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		let node;
		while ((node = walker.nextNode())) {
			const textNode = node as Text;
			const newContent = this.processDiceNotation(textNode.textContent!);
			if (newContent !== textNode.textContent) {
				const span = document.createElement("span");
				span.innerHTML = newContent;
				textNode.replaceWith(span);
			}
		}
	};

	processDiceNotation(text: string): string {
		const diceRegex = /(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/g;
		return text.replace(
			diceRegex,
			(match, numDice, numSides, operator, modifier) => {
				const average = this.calculateAverage(
					parseInt(numDice),
					parseInt(numSides),
					operator,
					modifier ? parseInt(modifier) : 0
				);
				return `${match} <span class="dice-stat-result">(avg: ${average.toFixed(
					2
				)})</span>`;
			}
		);
	}

	calculateAverage(
		numDice: number,
		numSides: number,
		operator?: string,
		modifier: number = 0
	): number {
		const averageRoll = (numDice * (numSides + 1)) / 2;
		if (operator === "+") return averageRoll + modifier;
		if (operator === "-") return averageRoll - modifier;
		return averageRoll;
	}
}
