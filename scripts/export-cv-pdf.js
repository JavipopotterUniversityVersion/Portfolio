const { chromium } = require('playwright');
const path = require('path');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: {
			width: 390,
			height: 1200,
		},
	});
	await page.emulateMedia({ media: 'screen' });

	const cvPath = path.resolve(__dirname, '../cv/index.html');
	const outputPath = path.resolve(__dirname, '../cv.pdf');

	await page.goto(`file://${cvPath}`, {
		waitUntil: 'networkidle',
	});

	await page.pdf({
		path: outputPath,
		format: 'A4',
		printBackground: true,
		preferCSSPageSize: true,
		margin: {
			top: '10mm',
			right: '10mm',
			bottom: '10mm',
			left: '10mm',
		},
	});

	await browser.close();

	console.log(`CV exportado en: ${outputPath}`);
})().catch(async (error) => {
	console.error(error);
	process.exit(1);
});
