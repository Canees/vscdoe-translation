import * as vscode from 'vscode';
import axios from "axios";

export function activate() {
	// 驼峰转换
	function changeWord(text: string): string {
		if (!text.includes(" ") && text.match(/[A-Z]/)) {
			const str = text.replace(/([A-Z])/g, " $1");
			let value = str.substr(0, 1).toUpperCase() + str.substr(1);
			return value;
		}
		return text;
	}
	// 请求翻译结果
	async function getTralstion(text: string) {
		const { status, data } = await axios.get(`https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${changeWord(text)}`);
		return status === 200 ? data.translateResult[0][0].tgt || '' : '';
	}
	// 鼠标hover 展示结果
	vscode.languages.registerHoverProvider('*', {
		provideHover: async (document, position, token) => {
			const editor = vscode.window.activeTextEditor;
			const selection = editor!.selection;
			const text = editor!.document.getText(selection);
			if (text) {
				const res = await getTralstion(text);
				const result = res.length > 80 ? '太长了翻译不了！' : '翻译好了->' + res;
				console.log('划词翻译：', text, result);
				return new vscode.Hover(result);
			} else {
				//获取悬浮区域文本
				const word = document.getText(document.getWordRangeAtPosition(position));
				const res = await getTralstion(word);
				const result = res.length > 80 ? '太长了翻译不了！' : '翻译好了->' + res;
				console.log('悬浮翻译：', text, result);
				return new vscode.Hover(result);
			}
		}
	});
}


export function deactivate() { }
