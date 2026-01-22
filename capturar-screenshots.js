const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 Iniciando captura de screenshots...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const desktopPath = path.join(require('os').homedir(), 'OneDrive', 'Área de Trabalho');

  try {
    // 1. Tela de Login
    console.log('📸 Capturando tela de login...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_1_Login.png'), fullPage: true });
    console.log('✅ Screenshot 1: Tela de Login');

    // 2. Fazer Login
    console.log('\n🔐 Fazendo login...');
    await page.fill('input[type="password"]', 'neco1910');
    await page.click('button:has-text("Entrar no Sistema")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_2_Lista_Pacientes.png'), fullPage: true });
    console.log('✅ Screenshot 2: Lista de Pacientes');

    // 3. Carregar Paciente Exemplo
    console.log('\n👤 Carregando paciente exemplo...');
    await page.click('button:has-text("Paciente Exemplo")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_3_Dados_Paciente.png'), fullPage: true });
    console.log('✅ Screenshot 3: Dados do Paciente');

    // 4. Aba Avaliação Inicial
    console.log('\n📊 Navegando para Avaliação Inicial...');
    await page.click('button:has-text("Avaliação")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_4_Avaliacao_Inicial.png'), fullPage: true });
    console.log('✅ Screenshot 4: Avaliação Inicial');

    // 5. Aba Adipômetro
    console.log('\n📏 Navegando para Adipômetro...');
    await page.click('button:has-text("Adipômetro")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_5_Adipometro.png'), fullPage: true });
    console.log('✅ Screenshot 5: Adipômetro (Medições Bilaterais)');

    // 6. Aba Plano Alimentar
    console.log('\n🍎 Navegando para Plano Alimentar...');
    await page.click('button:has-text("Plano Alimentar")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(desktopPath, 'Screenshot_6_Plano_Alimentar.png'), fullPage: true });
    console.log('✅ Screenshot 6: Plano Alimentar');

    // 7. Exportar PDF
    console.log('\n📄 Exportando PDF...');

    // Aguardar o download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("PDF")');
    const download = await downloadPromise;

    // Salvar o PDF
    const pdfPath = path.join(desktopPath, 'Plano_Alimentar_Carlos_Silva_DEMO.pdf');
    await download.saveAs(pdfPath);
    console.log('✅ PDF exportado: Plano_Alimentar_Carlos_Silva_DEMO.pdf');

    console.log('\n\n🎉 CAPTURA CONCLUÍDA COM SUCESSO!');
    console.log(`\n📁 Arquivos salvos em: ${desktopPath}`);
    console.log('\n📸 Screenshots capturados:');
    console.log('  1. Screenshot_1_Login.png');
    console.log('  2. Screenshot_2_Lista_Pacientes.png');
    console.log('  3. Screenshot_3_Dados_Paciente.png');
    console.log('  4. Screenshot_4_Avaliacao_Inicial.png');
    console.log('  5. Screenshot_5_Adipometro.png');
    console.log('  6. Screenshot_6_Plano_Alimentar.png');
    console.log('\n📄 PDF exportado:');
    console.log('  - Plano_Alimentar_Carlos_Silva_DEMO.pdf');

  } catch (error) {
    console.error('\n❌ Erro durante a captura:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Navegador fechado. Processo concluído!');
  }
})();
