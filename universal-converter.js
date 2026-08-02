const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertAllHtmlFiles() {
    try {
        console.log('🚀 Universal HTML to PDF Converter Starting...');
        console.log('==========================================');
        console.log('✨ Enhanced with: Emoji Support + Original Width Preserved');
        console.log('📁 Scanning input folder for HTML files...');
        
        const inputDir = path.join(__dirname, 'input');
        const outputDir = path.join(__dirname, 'output');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log('📂 Created output directory');
        }
        
        // Check if input directory exists
        if (!fs.existsSync(inputDir)) {
            console.error('❌ Input directory not found! Please create an "input" folder.');
            return;
        }
        
        // Get all HTML files from input directory
        const files = fs.readdirSync(inputDir).filter(file => 
            file.toLowerCase().endsWith('.html') || file.toLowerCase().endsWith('.htm')
        );
        
        if (files.length === 0) {
            console.log('❌ No HTML files found in input directory!');
            return;
        }
        
        console.log(`📄 Found ${files.length} HTML file(s):`);
        files.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file}`);
        });
        console.log('');
        
        // Launch browser with optimal settings for emoji rendering
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--disable-features=VizDisplayCompositor',
                '--force-color-profile=srgb',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                // Better font and emoji rendering
                '--font-render-hinting=none',
                '--enable-font-antialiasing',
                '--disable-font-subpixel-positioning',
                '--enable-lcd-text'
            ]
        });
        
        // Process each HTML file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = path.parse(file).name; // Get filename without extension
            
            console.log(`🔄 Processing ${i + 1}/${files.length}: ${file}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            await convertSingleFile(browser, inputDir, file, fileName, outputDir);
            
            console.log(`✅ Completed: ${file}`);
            console.log('');
        }
        
        await browser.close();
        
        console.log('🎉 All conversions completed!');
        console.log('📁 Check the output folder for your PDF files:');
        files.forEach(file => {
            const fileName = path.parse(file).name;
            console.log(`   📄 ${fileName}_Full.pdf`);
        });
        
    } catch (error) {
        console.error('❌ Error during conversion:', error);
    }
}

async function convertSingleFile(browser, inputDir, file, fileName, outputDir) {
    const page = await browser.newPage();
    
    try {
        // Set high-quality viewport with better emoji support but maintain original width
        await page.setViewport({
            width: 1920,
            height: 3000,
            deviceScaleFactor: 1  // Back to 1 to maintain original sizing
        });
        
        // Stay in screen mode (not print mode)
        await page.emulateMediaType('screen');
        
        // Set user agent to ensure proper font loading
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const htmlPath = path.join(inputDir, file);
        
        console.log('📄 Loading HTML content...');
        
        // Navigate to the HTML file
        await page.goto(`file://${htmlPath}`, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        
        console.log('⏳ Waiting for content to fully load...');
        
        // Wait for external resources to load
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Extra wait for font loading (important for emojis)
        console.log('🔤 Ensuring fonts and emojis are loaded...');
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => {
            if (!document.fonts) return true;
            return document.fonts.status === 'loaded';
        }, { timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Handle dynamic content (charts, animations, etc.)
        await page.evaluate(() => {
            return new Promise((resolve) => {
                // Handle Chart.js if present
                if (typeof Chart !== 'undefined' && Chart.instances) {
                    const charts = Object.values(Chart.instances);
                    if (charts.length === 0) {
                        resolve();
                        return;
                    }
                    
                    let readyCharts = 0;
                    charts.forEach(chart => {
                        if (chart.canvas && chart.data) {
                            chart.update('none');
                            readyCharts++;
                        }
                    });
                    
                    if (readyCharts === charts.length) {
                        setTimeout(resolve, 1000);
                    } else {
                        setTimeout(resolve, 3000);
                    }
                } else {
                    resolve();
                }
            });
        });
        
        console.log('🎬 Preparing content for capture...');
        
        // Prepare content for full capture
        await page.evaluate(() => {
            // Add emoji and font support styles
            const style = document.createElement('style');
            style.innerHTML = `
                *, *::before, *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
                
                /* Keep original document fonts; only improve rendering quality */
                body {
                    text-rendering: optimizeLegibility !important;
                    -webkit-font-smoothing: antialiased !important;
                    -moz-osx-font-smoothing: grayscale !important;
                }
                
                /* Fix text duplication by ensuring unique rendering */
                * {
                    -webkit-transform: translateZ(0) !important;
                    transform: translateZ(0) !important;
                }
            `;
            document.head.appendChild(style);
            
            // Remove overflow restrictions to show all content
            const body = document.body;
            const html = document.documentElement;
            
            body.style.overflow = 'visible';
            body.style.height = 'auto';
            body.style.minHeight = 'auto';
            html.style.overflow = 'visible';
            html.style.height = 'auto';
            
            // Fix main content areas
            const main = document.querySelector('main');
            if (main) {
                main.style.overflow = 'visible';
                main.style.overflowY = 'visible';
                main.style.height = 'auto';
                main.style.maxHeight = 'none';
            }
            
            // Fix sidebars
            const aside = document.querySelector('aside');
            if (aside) {
                aside.style.overflow = 'visible';
                aside.style.height = 'auto';
                aside.style.maxHeight = 'none';
            }
            
            // Fix flex containers
            document.querySelectorAll('.flex, .flex-1').forEach(el => {
                if (el.style.height === '100vh' || el.classList.contains('h-screen')) {
                    el.style.height = 'auto';
                    el.style.minHeight = '100vh';
                }
            });
            
            // Make sure all content is visible
            document.querySelectorAll('*').forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.overflow === 'hidden' || computedStyle.overflowY === 'hidden') {
                    el.style.overflow = 'visible';
                    el.style.overflowY = 'visible';
                }
            });
            
            // Ensure charts and images are visible
            document.querySelectorAll('canvas, img').forEach(element => {
                element.style.visibility = 'visible';
                element.style.display = 'block';
            });
            
            // Fix potential text duplication issues
            document.querySelectorAll('*').forEach(element => {
                // Remove duplicate text nodes
                const textNodes = Array.from(element.childNodes).filter(node => 
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                );
                
                // Clean up any webkit-specific rendering issues
                element.style.webkitBackfaceVisibility = 'hidden';
                element.style.backfaceVisibility = 'hidden';
            });
            
            // Keep original typography untouched.
        });
        
        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📐 Calculating content dimensions...');
        
        // Get full content dimensions
        const dimensions = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            
            // Force layout recalculation
            body.offsetHeight;
            
            const fullWidth = Math.max(
                body.scrollWidth,
                body.offsetWidth,
                html.clientWidth,
                html.scrollWidth,
                html.offsetWidth,
                window.innerWidth || 1920
            );
            
            const fullHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight,
                window.innerHeight || 1080
            );
            
            return { 
                width: fullWidth, 
                height: fullHeight,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            };
        });
        
        console.log(`📏 Content size: ${dimensions.width}px × ${dimensions.height}px`);
        console.log(`📐 PDF width will be: ${Math.max(dimensions.width, 1920)}px (preserving original HTML width)`);
        
        // Create PDF versions with enhanced emoji support and proper width
        const versions = [
            {
                name: 'Full',
                description: 'Full content capture with emoji support',
                options: {
                    width: `${Math.max(dimensions.width, 1920)}px`,
                    height: `${Math.max(dimensions.height, 2000)}px`,
                    printBackground: true,
                    margin: { top: 0, right: 0, bottom: 0, left: 0 },
                    displayHeaderFooter: false,
                    preferCSSPageSize: false,
                    omitBackground: false,
                    fullPage: true,
                    // Keep original width - remove format restriction
                    scale: 1,
                    quality: 100,
                    tagged: true
                }
            }
        ];
        
        console.log('🎨 Generating PDF versions...');
        
        for (const version of versions) {
            console.log(`   📄 Creating ${version.description}...`);
            
            try {
                const pdfBuffer = await page.pdf(version.options);
                const outputPath = path.join(outputDir, `${fileName}_${version.name}.pdf`);
                fs.writeFileSync(outputPath, pdfBuffer);
                console.log(`   ✅ ${version.description} saved as ${fileName}_${version.name}.pdf`);
            } catch (error) {
                console.log(`   ❌ Failed to create ${version.description}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
    } finally {
        await page.close();
    }
}

// Run the universal converter
convertAllHtmlFiles();