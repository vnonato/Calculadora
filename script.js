// Configurações dos marketplaces
const MARKETPLACES = {
  mercadolivre: {
    nome: "",
    logo: "mercadolivre.svg",
    comissao: 0.14, // 14%
    comissaoPremium: 0.19, // 19%
    tarifaFixa: {
      abaixo79: 6.00,
      acima79: 18.45
    }
  },
  shopee: {
    nome: "",
    logo: "shopee.svg",
    comissao: 0.20, // 20%
    comissaoFreteGratis: 0.20, // 20%
    tarifaFixa: 4.00, // R$ 4,00 por item
    taxaTransacao: 0.01 // 1%
  },
  amazon: {
    nome: "",
    logo: "amazon.svg",
    comissaoAbaixo15: 0.08, // 8% para produtos abaixo de R$ 15
    comissaoAcima15: 0.15, // 15% para produtos acima de R$ 15
    tarifaMinima: 1.00 // R$ 1,00 mínimo
  },
  tiktokshop: {
    nome: "",
    logo: "tiktok.svg",
    comissaoInicial: 0.018, // 1.8% nos primeiros 90 dias
    comissaoPadrao: 0.05 // 5% após período promocional
  },
  magalu: {
    nome: "",
    logo: "magalu.svg",
    comissao: 0.16, // 16% em média
    comissaoMinima: 0.12, // 12% mínimo
    comissaoMaxima: 0.20 // 20% máximo
  }
};

// Função utilitária para formatar número como moeda (R$)
function formatarNumero(valor) {
  // Verifica se o valor é um número válido
  if (isNaN(valor) || valor === null || valor === undefined) {
    return 'R$ 0,00';
  }
  return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Função utilitária para formatar número como percentual
function formatarPercentual(valor) {
  // Verifica se o valor é um número válido
  if (isNaN(valor) || valor === null || valor === undefined) {
    return '0,00%';
  }
  // Limita valores extremos para evitar exibição de Infinity ou números muito grandes
  if (valor > 9999) {
    return '9999,00%';
  }
  if (valor < -9999) {
    return '-9999,00%';
  }
  return valor.toFixed(2).replace('.', ',') + '%';
}

// Elementos de resultado
const precoVendaEl = document.getElementById('precoVenda');
const tarifaFixaEl = document.getElementById('tarifaFixa');
const tarifaExposicaoEl = document.getElementById('tarifaExposicao');
const irpjEl = document.getElementById('irpj');
const csllEl = document.getElementById('csll');
const lucroEl = document.getElementById('lucro');
const lucroSobreVendaEl = document.getElementById('lucroSobreVenda');
const lucroBrutoEl = document.getElementById('lucroBruto');
const feedbackEl = document.getElementById('feedback');
const resultadoTituloEl = document.getElementById('resultado-titulo');

// Elementos de entrada
const valorCompraEl = document.getElementById('valorCompra');
const lucroTipoEl = document.getElementById('tipoLucro');
const lucroDesejadoEl = document.getElementById('lucroDesejado');
const custoOperacionalEl = document.getElementById('custoOperacional');
const custosExtrasEl = document.getElementById('custosExtras');
const modoCalculoEl = document.getElementById('modoCalculo');
const marketplaceEl = document.getElementById('marketplace');
const grupoTipoLucroEl = document.getElementById('grupo-tipo-lucro');
const labelLucroDesejadoEl = document.getElementById('label-lucro-desejado');

// Elementos para tributos
const pisCofinsEl = document.getElementById('pisCofins');
const icmsEl = document.getElementById('icms');
const difalEl = document.getElementById('difal');
const pisMonofEl = document.getElementById('pisCofinsMonofasico');
const pisCredEl = document.getElementById('pisCofinsCredito');
const pisDebEl = document.getElementById('pisCofinsDebito');
const icmsSTEl = document.getElementById('icmsST');
const icmsPropEl = document.getElementById('icmsProprio');
const icmsCredEl = document.getElementById('icmsCredito');
const difalCheckEl = document.getElementById('aplicarDifal');
const estadoOrigemEl = document.getElementById('estadoOrigem');

// Elementos para comparação
const comparacaoContainerEl = document.getElementById('comparacao-container');
const marketplaceCardsEl = document.querySelector('.marketplace-cards');
const marketplaceLogoContainerEl = document.getElementById('marketplace-logo-container');

// Constantes para cálculos
const IRPJ = 0.25;
const CSLL = 0.09;

// Função para extrair valor numérico de um campo de entrada
function extrairValorNumerico(elemento) {
  if (!elemento || !elemento.value) return 0;
  
  const valor = parseFloat(elemento.value.replace(/[R$%\s]/g, '').replace(/\./g, '').replace(',', '.'));
  return isNaN(valor) ? 0 : valor;
}

// Função principal de cálculo
function calcular() {
  try {
    // Obtém o modo de cálculo atual
    const modoCalculo = modoCalculoEl.value;
    const marketplaceSelecionado = marketplaceEl.value;
    
    // Limpa o container de comparação
    marketplaceCardsEl.innerHTML = '';
    
    // Verifica se é para comparar todos os marketplaces
    if (marketplaceSelecionado === 'todos') {
      comparacaoContainerEl.classList.remove('hidden');
      
      // Calcula para cada marketplace
      for (const [id, marketplace] of Object.entries(MARKETPLACES)) {
        const resultado = modoCalculo === 'lucro-para-venda' 
          ? calcularVendaParaMarketplace(id) 
          : calcularLucroParaMarketplace(id);
        
        if (resultado) {
          adicionarCardComparacao(id, marketplace, resultado);
        }
      }
    } else {
      comparacaoContainerEl.classList.add('hidden');
      
      // Calcula apenas para o marketplace selecionado
      if (modoCalculo === 'lucro-para-venda') {
        calcularVendaParaMarketplace(marketplaceSelecionado);
      } else {
        calcularLucroParaMarketplace(marketplaceSelecionado);
      }
    }
    
    // Atualiza o logo do marketplace
    atualizarLogoMarketplace(marketplaceSelecionado);
  } catch (error) {
    console.error("Erro ao calcular:", error);
    feedbackEl.innerText = "Ocorreu um erro no cálculo. Por favor, verifique os valores inseridos.";
  }
}

// Função para atualizar os resultados na interface
function atualizarResultados(precoVenda, resultados) {
  // Verifica se os resultados são válidos
  if (!resultados) {
    precoVendaEl.innerText = formatarNumero(0);
    tarifaFixaEl.innerText = formatarNumero(0);
    tarifaExposicaoEl.innerText = formatarNumero(0);
    irpjEl.innerText = formatarNumero(0);
    csllEl.innerText = formatarNumero(0);
    lucroEl.innerText = formatarNumero(0);
    lucroSobreVendaEl.innerText = formatarPercentual(0);
    lucroBrutoEl.innerText = formatarPercentual(0);
    return;
  }

  // Atualiza os elementos da interface com os resultados calculados
  precoVendaEl.innerText = formatarNumero(precoVenda);
  tarifaFixaEl.innerText = formatarNumero(resultados.tarifaFixa);
  tarifaExposicaoEl.innerText = formatarNumero(resultados.tarifaMarketplace);
  irpjEl.innerText = formatarNumero(resultados.ir);
  csllEl.innerText = formatarNumero(resultados.cs);
  lucroEl.innerText = formatarNumero(resultados.lucroLiquido);
  
  // Calcula e formata as margens
  const margemVendaPercent = precoVenda > 0 ? (resultados.lucroLiquido / precoVenda) * 100 : 0;
  const valorCompra = extrairValorNumerico(valorCompraEl);
  const margemCustoPercent = valorCompra > 0 ? (resultados.lucroLiquido / valorCompra) * 100 : 0;
  
  lucroSobreVendaEl.innerText = formatarPercentual(margemVendaPercent);
  lucroBrutoEl.innerText = formatarPercentual(margemCustoPercent);
}

// Função para calcular o preço de venda a partir do lucro desejado para um marketplace específico
function calcularVendaParaMarketplace(marketplaceId) {
  try {
    // Obtém e parseia valores de entrada numéricos
    const valorCompra = extrairValorNumerico(valorCompraEl);
    const lucroTipo = lucroTipoEl.value;
    let lucroMeta = extrairValorNumerico(lucroDesejadoEl);
    const custoOperacional = extrairValorNumerico(custoOperacionalEl);
    const custosExtras = extrairValorNumerico(custosExtrasEl);

    // Validação básica
    if (valorCompra <= 0) {
      feedbackEl.innerText = "O custo do produto deve ser maior que zero.";
      return null;
    } else if (lucroMeta < 0) {
      feedbackEl.innerText = "O lucro desejado não pode ser negativo.";
      return null;
    } else {
      feedbackEl.innerText = "";
    }

    // Captura estado dos checkboxes de tributos
    const pisMonof = pisMonofEl.checked;
    const pisCred = pisCredEl.checked;
    const pisDeb = pisDebEl.checked;
    const icmsST = icmsSTEl.checked;
    const icmsProp = icmsPropEl.checked;
    const icmsCred = icmsCredEl.checked;
    const aplicarDifal = difalCheckEl.checked;
    const origem = estadoOrigemEl.value;

    // Função interna para calcular lucro líquido dado um certo preço, considerando tributos e marketplace
    function calcularLucroInterno(preco) {
      // Verifica se o preço é válido
      if (preco <= 0) {
        return {
          lucroLiquido: 0,
          margem: 0,
          tarifaFixa: 0,
          tarifaMarketplace: 0,
          ir: 0,
          cs: 0,
          totalTaxDebit: 0,
          totalTaxCredit: 0
        };
      }
      
      // Calcula tarifas do marketplace
      let tarifaFixaAtual = 0;
      let tarifaMarketplace = 0;
      
      switch (marketplaceId) {
        case 'mercadolivre':
          tarifaFixaAtual = preco >= 79 ? MARKETPLACES.mercadolivre.tarifaFixa.acima79 : MARKETPLACES.mercadolivre.tarifaFixa.abaixo79;
          tarifaMarketplace = preco * MARKETPLACES.mercadolivre.comissao;
          break;
        case 'shopee':
          tarifaFixaAtual = MARKETPLACES.shopee.tarifaFixa;
          tarifaMarketplace = preco * MARKETPLACES.shopee.comissao + preco * MARKETPLACES.shopee.taxaTransacao;
          break;
        case 'amazon':
          tarifaMarketplace = preco <= 15 ? preco * MARKETPLACES.amazon.comissaoAbaixo15 : preco * MARKETPLACES.amazon.comissaoAcima15;
          tarifaMarketplace = Math.max(tarifaMarketplace, MARKETPLACES.amazon.tarifaMinima);
          break;
        case 'tiktokshop':
          tarifaMarketplace = preco * MARKETPLACES.tiktokshop.comissaoPadrao;
          break;
        case 'magalu':
          tarifaMarketplace = preco * MARKETPLACES.magalu.comissao;
          break;
      }
      
      const custosTotaisFixos = valorCompra + custoOperacional + custosExtras + tarifaFixaAtual;
      
      // Cálculo dos tributos incidentes
      let totalTaxDebit = 0;
      let totalTaxCredit = 0;
      if (!pisMonof) {
        if (pisDeb) totalTaxDebit += 0.0925 * preco;
        if (pisCred) totalTaxCredit += 0.0925 * valorCompra;
      }
      if (!icmsST) {
        if (aplicarDifal && origem !== 'SP') {
          const internalDestRate = 0.18;
          const interstateRate = 0.12;
          totalTaxDebit += interstateRate * preco;
          totalTaxDebit += (internalDestRate - interstateRate) * preco;
        } else if (icmsProp) {
          totalTaxDebit += 0.18 * preco;
        }
        if (icmsCred) {
          totalTaxCredit += 0.18 * valorCompra;
        }
      }
      const lucroAntesImpostosLucro = preco - custosTotaisFixos - tarifaMarketplace - totalTaxDebit + totalTaxCredit;
      const ir = IRPJ * Math.max(lucroAntesImpostosLucro, 0);
      const cs = CSLL * Math.max(lucroAntesImpostosLucro, 0);
      const lucroLiquidoAtual = lucroAntesImpostosLucro - ir - cs;
      return {
        lucroLiquido: lucroLiquidoAtual,
        margem: preco > 0 ? lucroLiquidoAtual / preco : 0,
        tarifaFixa: tarifaFixaAtual,
        tarifaMarketplace: tarifaMarketplace,
        ir: ir,
        cs: cs,
        totalTaxDebit: totalTaxDebit,
        totalTaxCredit: totalTaxCredit
      };
    }

    let precoFinal = 0;

    if (lucroTipo === 'percentual') {
      // Busca do preço por bisseção para margem desejada
      const lucroDesejado = lucroMeta / 100;
      
      // Verifica se o lucro desejado é válido
      if (lucroDesejado <= 0 || lucroDesejado >= 1) {
        precoFinal = valorCompra * 2; // Valor padrão se o lucro desejado for inválido
      } else {
        let precoMin = 0;
        let precoMax = 0;
        
        // Determina preço inicial para bisseção
        let precoInicial = valorCompra * 2; // Começa com o dobro do custo
        const margemInicial = calcularLucroInterno(precoInicial).margem;

        if (margemInicial >= lucroDesejado) {
          precoMax = precoInicial;
          const custosFixosBase = valorCompra + custoOperacional + custosExtras;
          precoMin = Math.max(custosFixosBase, precoMax * 0.5);
        } else {
          precoMin = precoInicial;
          precoMax = precoMin * 4;
          let iteracoes = 0;
          while (calcularLucroInterno(precoMax).margem < lucroDesejado) {
            precoMax *= 2;
            iteracoes++;
            if (precoMax > 1000000 || iteracoes > 10) break;
          }
        }

        // Algoritmo de bisseção
        for (let i = 0; i < 50; i++) {
          const mid = (precoMin + precoMax) / 2;
          const margemAtual = calcularLucroInterno(mid).margem;
          if (Math.abs(margemAtual - lucroDesejado) <= 1e-6) break;
          if (margemAtual < lucroDesejado) {
            precoMin = mid;
          } else {
            precoMax = mid;
          }
        }

        precoFinal = parseFloat(precoMax.toFixed(2));
      }
    } else {
      // Busca binária para atingir lucro absoluto desejado
      if (lucroMeta <= 0) {
        precoFinal = valorCompra * 2; // Valor padrão se o lucro desejado for inválido
      } else {
        let precoMin = 0;
        let precoMax = valorCompra + custoOperacional + custosExtras + lucroMeta * 2;
        if (calcularLucroInterno(precoMax).lucroLiquido < lucroMeta) {
          precoMin = precoMax;
          precoMax = precoMin * 2;
          let iteracoes = 0;
          while (calcularLucroInterno(precoMax).lucroLiquido < lucroMeta) {
            precoMax *= 2;
            iteracoes++;
            if (precoMax > 1000000 || iteracoes > 10) break;
          }
        }
        for (let i = 0; i < 50; i++) {
          const mid = (precoMin + precoMax) / 2;
          const lucroAtual = calcularLucroInterno(mid).lucroLiquido;
          if (Math.abs(lucroAtual - lucroMeta) <= 1e-6) break;
          if (lucroAtual < lucroMeta) {
            precoMin = mid;
          } else {
            precoMax = mid;
          }
        }
        precoFinal = parseFloat(precoMax.toFixed(2));
      }
    }

    // Calcula os resultados finais
    const resultados = calcularLucroInterno(precoFinal);
    
    // Se não estamos no modo de comparação, atualiza a interface
    if (marketplaceId === marketplaceEl.value) {
      atualizarResultados(precoFinal, resultados);
    }
    
    // Retorna os resultados para uso na comparação
    return {
      precoVenda: precoFinal,
      lucroLiquido: resultados.lucroLiquido,
      margemVenda: resultados.margem * 100,
      margemCusto: valorCompra > 0 ? (resultados.lucroLiquido / valorCompra) * 100 : 0,
      tarifaFixa: resultados.tarifaFixa,
      tarifaMarketplace: resultados.tarifaMarketplace
    };
  } catch (error) {
    console.error("Erro ao calcular venda para marketplace:", error);
    feedbackEl.innerText = "Ocorreu um erro no cálculo. Por favor, verifique os valores inseridos.";
    return null;
  }
}

// Função para calcular o lucro a partir do preço de venda para um marketplace específico
function calcularLucroParaMarketplace(marketplaceId) {
  try {
    // Obtém e parseia valores de entrada numéricos
    const valorCompra = extrairValorNumerico(valorCompraEl);
    const precoVenda = extrairValorNumerico(lucroDesejadoEl);
    const custoOperacional = extrairValorNumerico(custoOperacionalEl);
    const custosExtras = extrairValorNumerico(custosExtrasEl);

    // Validação básica
    if (valorCompra <= 0) {
      feedbackEl.innerText = "O custo do produto deve ser maior que zero.";
      return null;
    } else if (precoVenda <= 0) {
      feedbackEl.innerText = "O preço de venda deve ser maior que zero.";
      return null;
    } else {
      feedbackEl.innerText = "";
    }

    // Captura estado dos checkboxes de tributos
    const pisMonof = pisMonofEl.checked;
    const pisCred = pisCredEl.checked;
    const pisDeb = pisDebEl.checked;
    const icmsST = icmsSTEl.checked;
    const icmsProp = icmsPropEl.checked;
    const icmsCred = icmsCredEl.checked;
    const aplicarDifal = difalCheckEl.checked;
    const origem = estadoOrigemEl.value;

    // Calcula tarifas do marketplace
    let tarifaFixaAtual = 0;
    let tarifaMarketplace = 0;
    
    switch (marketplaceId) {
      case 'mercadolivre':
        tarifaFixaAtual = precoVenda >= 79 ? MARKETPLACES.mercadolivre.tarifaFixa.acima79 : MARKETPLACES.mercadolivre.tarifaFixa.abaixo79;
        tarifaMarketplace = precoVenda * MARKETPLACES.mercadolivre.comissao;
        break;
      case 'shopee':
        tarifaFixaAtual = MARKETPLACES.shopee.tarifaFixa;
        tarifaMarketplace = precoVenda * MARKETPLACES.shopee.comissao + precoVenda * MARKETPLACES.shopee.taxaTransacao;
        break;
      case 'amazon':
        tarifaMarketplace = precoVenda <= 15 ? precoVenda * MARKETPLACES.amazon.comissaoAbaixo15 : precoVenda * MARKETPLACES.amazon.comissaoAcima15;
        tarifaMarketplace = Math.max(tarifaMarketplace, MARKETPLACES.amazon.tarifaMinima);
        break;
      case 'tiktokshop':
        tarifaMarketplace = precoVenda * MARKETPLACES.tiktokshop.comissaoPadrao;
        break;
      case 'magalu':
        tarifaMarketplace = precoVenda * MARKETPLACES.magalu.comissao;
        break;
    }
    
    // Cálculo dos tributos incidentes
    let totalTaxDebit = 0;
    let totalTaxCredit = 0;
    if (!pisMonof) {
      if (pisDeb) totalTaxDebit += 0.0925 * precoVenda;
      if (pisCred) totalTaxCredit += 0.0925 * valorCompra;
    }
    if (!icmsST) {
      if (aplicarDifal && origem !== 'SP') {
        const internalDestRate = 0.18;
        const interstateRate = 0.12;
        totalTaxDebit += interstateRate * precoVenda;
        totalTaxDebit += (internalDestRate - interstateRate) * precoVenda;
      } else if (icmsProp) {
        totalTaxDebit += 0.18 * precoVenda;
      }
      if (icmsCred) {
        totalTaxCredit += 0.18 * valorCompra;
      }
    }
    
    // Cálculo do lucro
    const custosTotaisFixos = valorCompra + custoOperacional + custosExtras + tarifaFixaAtual;
    const lucroAntesImpostos = precoVenda - custosTotaisFixos - tarifaMarketplace - totalTaxDebit + totalTaxCredit;
    const ir = IRPJ * Math.max(lucroAntesImpostos, 0);
    const cs = CSLL * Math.max(lucroAntesImpostos, 0);
    const lucroLiquido = lucroAntesImpostos - ir - cs;
    
    // Cálculo das margens
    const margemVenda = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;
    const margemCusto = valorCompra > 0 ? (lucroLiquido / valorCompra) * 100 : 0;
    
    // Resultados para cálculo de tributos
    let pisCofinsValue = 0;
    let icmsValue = 0;
    let difalValue = 0;
    if (!pisMonof) {
      const pisOnSale = pisDeb ? 0.0925 * precoVenda : 0;
      const pisCreditVal = pisCred ? 0.0925 * valorCompra : 0;
      pisCofinsValue = pisOnSale - pisCreditVal;
    }
    if (!icmsST) {
      if (aplicarDifal && origem !== 'SP') {
        const internalDestRate = 0.18;
        const interstateRate = 0.12;
        const originIcms = interstateRate * precoVenda;
        const destDifal = (internalDestRate - interstateRate) * precoVenda;
        const creditIcms = icmsCred ? 0.18 * valorCompra : 0;
        icmsValue = originIcms - creditIcms;
        difalValue = destDifal;
      } else {
        const originIcms = icmsProp ? 0.18 * precoVenda : 0;
        const creditIcms = icmsCred ? 0.18 * valorCompra : 0;
        icmsValue = originIcms - creditIcms;
      }
    }
    
    // Se não estamos no modo de comparação, atualiza a interface
    if (marketplaceId === marketplaceEl.value) {
      const resultados = {
        lucroLiquido: lucroLiquido,
        margem: margemVenda / 100,
        tarifaFixa: tarifaFixaAtual,
        tarifaMarketplace: tarifaMarketplace,
        ir: ir,
        cs: cs,
        totalTaxDebit: totalTaxDebit,
        totalTaxCredit: totalTaxCredit
      };
      atualizarResultados(precoVenda, resultados);
    }
    
    // Retorna os resultados para uso na comparação
    return {
      precoVenda: precoVenda,
      lucroLiquido: lucroLiquido,
      margemVenda: margemVenda,
      margemCusto: margemCusto,
      tarifaFixa: tarifaFixaAtual,
      tarifaMarketplace: tarifaMarketplace
    };
  } catch (error) {
    console.error("Erro ao calcular lucro para marketplace:", error);
    feedbackEl.innerText = "Ocorreu um erro no cálculo. Por favor, verifique os valores inseridos.";
    return null;
  }
}

// Função para adicionar um card de comparação
function adicionarCardComparacao(id, marketplace, resultado) {
  try {
    // Verifica se o resultado é válido
    if (!resultado) return;
    
    const card = document.createElement('div');
    card.className = 'marketplace-card';
    
    card.innerHTML = `
      <div class="marketplace-card-header">
        <img src="${marketplace.logo}" alt="${marketplace.nome}" class="marketplace-card-logo">
        <h3 class="marketplace-card-title">${marketplace.nome}</h3>
      </div>
      <div class="marketplace-card-content">
        <p><strong>Preço de Venda:</strong> <span>${formatarNumero(resultado.precoVenda)}</span></p>
        <p><strong>Tarifa Fixa:</strong> <span>${formatarNumero(resultado.tarifaFixa)}</span></p>
        <p><strong>Comissão:</strong> <span>${formatarNumero(resultado.tarifaMarketplace)} (${formatarPercentual(resultado.tarifaMarketplace / resultado.precoVenda * 100)})</span></p>
        <p><strong>Lucro Líquido:</strong> <span class="highlight">${formatarNumero(resultado.lucroLiquido)}</span></p>
        <p><strong>Margem sobre Venda:</strong> <span class="highlight">${formatarPercentual(resultado.margemVenda)}</span></p>
        <p><strong>Margem sobre Custo:</strong> <span class="highlight">${formatarPercentual(resultado.margemCusto)}</span></p>
      </div>
    `;
    
    marketplaceCardsEl.appendChild(card);
  } catch (error) {
    console.error("Erro ao adicionar card de comparação:", error);
  }
}

// Função para atualizar o logo do marketplace
function atualizarLogoMarketplace(marketplaceId) {
  try {
    marketplaceLogoContainerEl.innerHTML = '';
    
    if (marketplaceId === 'todos') {
      // Adiciona todos os logos
      for (const [id, marketplace] of Object.entries(MARKETPLACES)) {
        const logo = document.createElement('img');
        logo.src = marketplace.logo;
        logo.alt = marketplace.nome;
        logo.className = 'marketplace-logo';
       
      }
    } else if (marketplaceId !== 'todos' && MARKETPLACES[marketplaceId]) {
      // Adiciona apenas o logo do marketplace selecionado
      const logo = document.createElement('img');
      logo.src = MARKETPLACES[marketplaceId].logo;
      logo.alt = MARKETPLACES[marketplaceId].nome;
      logo.className = 'marketplace-logo';
      marketplaceLogoContainerEl.appendChild(logo);
    }
  } catch (error) {
    console.error("Erro ao atualizar logo do marketplace:", error);
  }
}

// Função para atualizar as máscaras de entrada conforme o modo de cálculo
function atualizarMascaras() {
  try {
    const modoCalculo = modoCalculoEl.value;
    const lucroTipo = lucroTipoEl.value;
    
    // Atualiza labels e placeholders
    if (modoCalculo === 'lucro-para-venda') {
      labelLucroDesejadoEl.textContent = 'Lucro desejado:';
      resultadoTituloEl.textContent = 'Preço de Venda';
      grupoTipoLucroEl.style.display = 'flex';
    } else {
      labelLucroDesejadoEl.textContent = 'Preço de venda:';
      resultadoTituloEl.textContent = 'Lucro Calculado';
      grupoTipoLucroEl.style.display = 'none';
    }
    
    // Remove máscaras existentes
    if (Inputmask && Inputmask.isValid && lucroDesejadoEl.value && Inputmask.isValid(lucroDesejadoEl.value, { alias: "numeric" })) {
      Inputmask.remove(lucroDesejadoEl);
    }
    
    // Aplica máscaras apropriadas
    if (modoCalculo === 'lucro-para-venda') {
      if (lucroTipo === 'percentual') {
        Inputmask({
          alias: 'numeric',
          suffix: '%',
          radixPoint: ',',
          groupSeparator: '.',
          digits: 2,
          digitsOptional: true,
          allowMinus: false,
          autoGroup: true
        }).mask(lucroDesejadoEl);
      } else {
        Inputmask({
          alias: 'numeric',
          prefix: 'R$ ',
          groupSeparator: '.',
          radixPoint: ',',
          digits: 2,
          digitsOptional: false,
          allowMinus: false,
          autoGroup: true
        }).mask(lucroDesejadoEl);
      }
    } else {
      // No modo venda-para-lucro, sempre usar máscara de moeda
      Inputmask({
        alias: 'numeric',
        prefix: 'R$ ',
        groupSeparator: '.',
        radixPoint: ',',
        digits: 2,
        digitsOptional: false,
        allowMinus: false,
        autoGroup: true
      }).mask(lucroDesejadoEl);
      
      // Desabilita o select de tipo de lucro no modo venda-para-lucro
      lucroTipoEl.disabled = modoCalculo === 'venda-para-lucro';
    }
    
    // Recalcula com os novos valores
    calcular();
  } catch (error) {
    console.error("Erro ao atualizar máscaras:", error);
  }
}

// Eventos para atualizar cálculo quando entradas do formulário mudam
document.querySelectorAll('#calcForm input, #calcForm select').forEach(elem => {
  elem.addEventListener('input', calcular);
});

// Eventos para checkboxes e select de tributos
document.querySelectorAll('#card-tributos input, #card-tributos select').forEach(elem => {
  elem.addEventListener('input', calcular);
});

// Regras de dependência entre checkboxes (ativação/desativação)
pisMonofEl.addEventListener('change', () => {
  if (pisMonofEl.checked) {
    pisCredEl.checked = false;
    pisDebEl.checked = false;
    pisCredEl.disabled = true;
    pisDebEl.disabled = true;
  } else {
    pisCredEl.disabled = false;
    pisDebEl.disabled = false;
  }
  calcular();
});

icmsSTEl.addEventListener('change', () => {
  if (icmsSTEl.checked) {
    icmsPropEl.checked = false;
    icmsCredEl.checked = false;
    icmsPropEl.disabled = true;
    icmsCredEl.disabled = true;
  } else {
    icmsPropEl.disabled = false;
    icmsCredEl.disabled = false;
  }
  calcular();
});

difalCheckEl.addEventListener('change', () => {
  if (difalCheckEl.checked) {
    icmsPropEl.checked = false;
    icmsPropEl.disabled = true;
  } else {
    icmsPropEl.disabled = false;
  }
  calcular();
});

// Evento para mudança no modo de cálculo
modoCalculoEl.addEventListener('change', atualizarMascaras);

// Evento para mudança no tipo de lucro
lucroTipoEl.addEventListener('change', atualizarMascaras);

// Evento para mudança no marketplace
marketplaceEl.addEventListener('change', calcular);

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  try {
    // Aplica máscaras de moeda nos campos monetários
    const moedaMask = {
      alias: 'numeric',
      prefix: 'R$ ',
      groupSeparator: '.',
      radixPoint: ',',
      digits: 2,
      digitsOptional: false,
      allowMinus: false,
      autoGroup: true
    };
    
    Inputmask(moedaMask).mask(valorCompraEl);
    Inputmask(moedaMask).mask(custoOperacionalEl);
    Inputmask(moedaMask).mask(custosExtrasEl);
    
    // Inicializa estado dos checkboxes dependentes
    pisCredEl.disabled = pisMonofEl.checked;
    pisDebEl.disabled = pisMonofEl.checked;
    icmsPropEl.disabled = icmsSTEl.checked || difalCheckEl.checked;
    icmsCredEl.disabled = icmsSTEl.checked;
    
    // Inicializa máscaras conforme modo de cálculo
    atualizarMascaras();
    
    // Cálculo inicial
    calcular();
  } catch (error) {
    console.error("Erro na inicialização:", error);
  }
});
