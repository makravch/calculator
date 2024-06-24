const PMT_RATE = 0.16 / 12;
const PMT_TYPE = 0;
const MAX_AP_FV = 5000000;

window.addEventListener("load", function () {
  /*Сам калькулятор */
  const rangeCost = document.querySelector("#cost-price"),
    rangeAdvancePayment = document.querySelector("#advance-payment-price"),
    rangeNperiod = document.querySelector("#nperiod-price"),
    rangeFv = document.querySelector("#fv-price");

  const inputCost = document.querySelector(".calc__item-price--cost");
  const inputAdvancePayment = document.querySelector(
    ".calc__item-price--advance-payment"
  );
  const inputNperiod = document.querySelector(".calc__item-price--nperiod");
  const inputFv = document.querySelector(".calc__item-price--fv");

  const rangeMaxAdvancePayment = document.querySelector(
    ".calc__item--advance-payment .calc__range-text--max"
  );
  const rangeMaxFv = document.querySelector(
    ".calc__item--fv .calc__range-text--max"
  );

  const monthlyPaymentEl = document.querySelector(
    ".calc__result-row-price--monthly-payment"
  );
  const ndsEl = document.querySelector(".calc__result-row-price--nds");
  const incomeTaxSavingsEl = document.querySelector(
    ".calc__result-row-price--income-tax-savings"
  );
  const totalSavingsEl = document.querySelector(
    ".calc__result-row-price--total-savings"
  );

  // const financingPeriodsEl = document.querySelector(".financing__periods");
  const financingPaymentEl = document.querySelector(".financing__payment");
  const financingTotalEl = document.querySelector(
    ".financing__total-financing-value"
  );
  const financingOverpaymentEl = document.querySelector(
    ".financing__overpayment-value"
  );

  const bubbleCost = document.querySelector(
    ".calc__item--cost .calc__item-value"
  );
  const bubbleAdvancePayment = document.querySelector(
    ".calc__item--advance-payment .calc__item-value"
  );
  const bubbleNperiod = document.querySelector(
    ".calc__item--nperiod .calc__item-value"
  );
  const bubbleFv = document.querySelector(".calc__item--fv .calc__item-value");

  let lastValueRangeCost = +rangeCost.value;

  function handleRangeProgressbar(range, value) {
    range.style.setProperty("--value", value);
    range.style.setProperty("--max", range.max == "" ? "100" : range.max);
  }

  /*Функция обновления в dom */
  function calc() {
    let cost = +rangeCost.value,
      advancePayment = +rangeAdvancePayment.value,
      nperiod = +rangeNperiod.value,
      fv = +rangeFv.value;

    let pv = cost - advancePayment;

    const payment = -pmt(PMT_RATE, nperiod, pv, -1 * fv, PMT_TYPE);
    const nds = getNds(payment, nperiod, advancePayment, fv);
    const incomeTaxSavings = getIncomeTaxSavings(
      payment,
      nperiod,
      advancePayment,
      fv
    );
    const totalSavings = getTotalSavings(nds, incomeTaxSavings);

    const contractSum = getContractSum(payment, nperiod, advancePayment, fv);
    const totalFinancingSum = getTotalFinancingSum(cost, advancePayment);
    const overpaymentValue = getOverpaymentValue(
      payment,
      nperiod,
      advancePayment,
      fv,
      cost
    );

    monthlyPaymentEl.innerText = numberWithSpaces(Math.ceil(payment));
    ndsEl.innerText = numberWithSpaces(Math.ceil(nds));
    incomeTaxSavingsEl.innerText = numberWithSpaces(
      Math.ceil(incomeTaxSavings)
    );
    totalSavingsEl.innerText = numberWithSpaces(Math.ceil(totalSavings));

    // financingPeriodsEl.innerText = `${nperiod} ${morph(nperiod)}`;
    financingPaymentEl.innerText = numberWithSpaces(Math.ceil(contractSum));
    financingTotalEl.innerText = numberWithSpaces(Math.ceil(totalFinancingSum));
    financingOverpaymentEl.innerText = numberWithSpaces(
      Math.ceil(overpaymentValue)
    );
  }

  /*Слушатель на  инпуты ранже */
  function rangeLive(range, bubble) {
    range.addEventListener("input", (ev) => {
      let sumAPFV =
        parseInt(rangeAdvancePayment.value) + parseInt(rangeFv.value);
      let rangeCostValue = parseInt(rangeCost.value);
      let rangeAdvancePaymentValue = parseInt(rangeAdvancePayment.value);
      let rangeFvValue = parseInt(rangeFv.value);

      if (range.name === "cost-price") {
        if (rangeCostValue < sumAPFV) {
          range.value = sumAPFV;
          rangeCostValue = sumAPFV;
        }

        let newMaxFv;

        if (rangeCostValue > MAX_AP_FV) {
          newMaxFv = MAX_AP_FV - rangeAdvancePaymentValue;
        } else {
          newMaxFv = rangeCostValue - rangeAdvancePaymentValue;
        }

        rangeFv.max = newMaxFv;
        rangeMaxFv.textContent = numberWithSpaces(newMaxFv) + " ₽";
        handleBubblePosition(rangeFv, bubbleFv);
        handleRangeProgressbar(rangeFv, rangeFv.value);

        if (rangeFv.max > rangeFv.min) {
          handleBubblePosition(rangeFv, bubbleFv);
          handleRangeProgressbar(rangeFv, rangeFv.value);
        }

        let newMaxAdvancePayment;

        if (rangeCostValue > MAX_AP_FV) {
          newMaxAdvancePayment = MAX_AP_FV - rangeFvValue;
        } else {
          newMaxAdvancePayment = rangeCostValue - rangeFvValue;
        }

        rangeAdvancePayment.max = newMaxAdvancePayment;
        rangeMaxAdvancePayment.textContent =
          numberWithSpaces(newMaxAdvancePayment) + " ₽";

        if (rangeAdvancePayment.max > rangeAdvancePayment.min) {
          handleBubblePosition(rangeAdvancePayment, bubbleAdvancePayment);
          handleRangeProgressbar(
            rangeAdvancePayment,
            rangeAdvancePayment.value
          );
        }
      }

      if (range.name === "advance-payment-price") {
        let newMaxFv;

        if (rangeCostValue > MAX_AP_FV) {
          newMaxFv = MAX_AP_FV - rangeAdvancePaymentValue;
        } else {
          newMaxFv = rangeCostValue - rangeAdvancePaymentValue;
        }

        rangeFv.max = newMaxFv;
        rangeMaxFv.textContent = numberWithSpaces(newMaxFv) + " ₽";

        if (rangeFv.max > rangeFv.min) {
          handleBubblePosition(rangeFv, bubbleFv);
          handleRangeProgressbar(rangeFv, rangeFv.value);
        }
      }

      if (range.name === "fv-price") {
        let newMaxAdvancePayment;

        if (rangeCostValue > MAX_AP_FV) {
          newMaxAdvancePayment = MAX_AP_FV - rangeFvValue;
        } else {
          newMaxAdvancePayment = rangeCostValue - rangeFvValue;
        }

        rangeAdvancePayment.max = newMaxAdvancePayment;
        rangeMaxAdvancePayment.textContent =
          numberWithSpaces(newMaxAdvancePayment) + " ₽";

        if (rangeAdvancePayment.max > rangeAdvancePayment.min) {
          handleBubblePosition(rangeAdvancePayment, bubbleAdvancePayment);
          handleRangeProgressbar(
            rangeAdvancePayment,
            rangeAdvancePayment.value
          );
        }
      }

      handleBubbleValue(range.value, bubble);
      handleBubblePosition(range, bubble);
      calc();
    });
  }

  /*Изменение позиции бабла над инпутом */
  function handleBubblePosition(range, bubble) {
    const val = range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 100;
    const ratio = Number((val - min) / (max - min));

    bubble.style.left = "auto";
    bubble.style.right = "auto";

    bubble.style.left = `calc((8px + ${ratio} * (100% - 16px)) - ${
      bubble.offsetWidth / 2 - 8
    }px)`;

    const bubbleDimensions = bubble.getBoundingClientRect();
    const bubbleParentDimensions = bubble.parentNode.getBoundingClientRect();

    if (bubbleDimensions.left < bubbleParentDimensions.left) {
      bubble.style.left = 0;
    }

    if (bubbleDimensions.right > bubbleParentDimensions.right) {
      bubble.style.left = "auto";
      bubble.style.right = 0;
    }
  }

  /*Изменение значения бабла */
  function handleBubbleValue(value, bubble) {
    const bubbleText = bubble.querySelector(".calc__item-price");
    let newNumber = numberWithSpaces(value);

    bubbleText.innerText = newNumber;
  }

  rangeLive(rangeCost, bubbleCost);
  rangeLive(rangeAdvancePayment, bubbleAdvancePayment);
  rangeLive(rangeNperiod, bubbleNperiod);
  rangeLive(rangeFv, bubbleFv);

  handleBubbleValue(rangeCost.value, bubbleCost);
  handleBubbleValue(rangeAdvancePayment.value, bubbleAdvancePayment);
  handleBubbleValue(rangeNperiod.value, bubbleNperiod);
  handleBubbleValue(rangeFv.value, bubbleFv);

  handleBubblePosition(rangeCost, bubbleCost);
  handleBubblePosition(rangeAdvancePayment, bubbleAdvancePayment);
  handleBubblePosition(rangeNperiod, bubbleNperiod);
  handleBubblePosition(rangeFv, bubbleFv);

  calc();

  function inputFocusIn(input, range, bubble) {
    input.addEventListener("focusin", (e) => {
      const value = e.currentTarget.textContent.split(" ").join("");
      e.currentTarget.textContent = value;
      handleBubblePosition(range, bubble);
    });
  }

  inputFocusIn(inputCost, rangeCost, bubbleCost);
  inputFocusIn(inputAdvancePayment, rangeAdvancePayment, bubbleAdvancePayment);
  inputFocusIn(inputNperiod, rangeNperiod, bubbleNperiod);
  inputFocusIn(inputFv, rangeFv, bubbleFv);

  function inputKeyUp(input, range, bubble) {
    input.addEventListener("keyup", (e) => {
      if (
        !isInteger(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowLeft"
      ) {
        e.preventDefault();
        return;
      }

      const value = parseInt(e.currentTarget.textContent.split(" ").join(""));

      if (Number.isNaN(value) || value === 0) {
        e.currentTarget.textContent = 0;
        setCursorCaret(e.currentTarget);
        e.preventDefault();
      }

      if (e.key === "Backspace" && value === 0) {
        e.currentTarget.textContent = 0;
        setCursorCaret(e.currentTarget);
      }

      handleBubblePosition(range, bubble);
    });
  }

  inputKeyUp(inputCost, rangeCost, bubbleCost);
  inputKeyUp(inputAdvancePayment, rangeAdvancePayment, bubbleAdvancePayment);
  inputKeyUp(inputNperiod, rangeNperiod, bubbleNperiod);
  inputKeyUp(inputFv, rangeFv, bubbleFv);

  function inputKeyDown(input, range, bubble) {
    input.addEventListener("keydown", (e) => {
      if (
        !isInteger(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowLeft" &&
        e.key !== "Enter"
      ) {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        input.dispatchEvent(new Event("focusout"));
        window.getSelection().removeAllRanges();
        e.preventDefault();
        return;
      }

      const value = parseInt(e.currentTarget.textContent.split(" ").join(""));

      if (Number.isNaN(value)) {
        e.currentTarget.textContent = 0;
        setCursorCaret(e.currentTarget);
        e.preventDefault();
      }

      if (isInteger(e.key) && value === 0) {
        e.currentTarget.textContent = e.key;
        setCursorCaret(e.currentTarget);
        e.preventDefault();
      }

      if (value >= parseInt(range.max) && isInteger(e.key)) {
        e.currentTarget.textContent = range.max;
        setCursorCaret(e.currentTarget);
        e.preventDefault();
      }

      handleBubblePosition(range, bubble);
    });
  }

  inputKeyDown(inputCost, rangeCost, bubbleCost);
  inputKeyDown(inputAdvancePayment, rangeAdvancePayment, bubbleAdvancePayment);
  inputKeyDown(inputNperiod, rangeNperiod, bubbleNperiod);
  inputKeyDown(inputFv, rangeFv, bubbleFv);

  function inputFocusOut(input, range) {
    input.addEventListener("focusout", (e) => {
      const value = parseInt(e.currentTarget.textContent.split(" ").join(""));

      if (Number.isNaN(value) || value <= parseInt(range.min)) {
        e.currentTarget.textContent = numberWithSpaces(range.min);
        range.value = range.min;
      } else {
        e.currentTarget.textContent = numberWithSpaces(value);
        range.value = value;
      }

      range.dispatchEvent(new Event("input"));
    });
  }

  inputFocusOut(inputCost, rangeCost);
  inputFocusOut(inputAdvancePayment, rangeAdvancePayment);
  inputFocusOut(inputNperiod, rangeNperiod);
  inputFocusOut(inputFv, rangeFv);

  [inputCost, inputAdvancePayment, inputNperiod, inputFv].forEach((input) => {
    input.addEventListener("paste", (e) => {
      e.preventDefault();
    });
  });

  for (let e of document.querySelectorAll(
    'input[type="range"].slider-progress'
  )) {
    e.style.setProperty("--value", e.value);
    e.style.setProperty("--min", e.min == "" ? "0" : e.min);
    e.style.setProperty("--max", e.max == "" ? "100" : e.max);
    e.addEventListener("input", (ev) => {
      handleRangeProgressbar(e, ev.target.value);
    });
  }
});

/*Хелперы*/

/* Функция расчета ежемесячного платежа*/
function pmt(rate, nperiod, pv, fv, type) {
  if (!fv) fv = 0;
  if (!type) type = 0;

  if (rate == 0) return -(pv + fv) / nperiod;

  var pvif = Math.pow(1 + rate, nperiod);
  var pmt = (rate / (pvif - 1)) * -(pv * pvif + fv);

  if (type == 1) {
    pmt /= 1 + rate;
  }

  return pmt;
}

/* Функция расчета НДС к вычету*/
function getNds(payment, nperiod, advancePayment, fv) {
  return (payment * nperiod + advancePayment + fv) / 6;
}

/* Функция расчета экономии по налогу на прибыль*/
function getIncomeTaxSavings(payment, nperiod, advancePayment, fv) {
  return (payment * nperiod + advancePayment + fv) / 6;
}

/* Функция расчета общей налоговой выгоды*/
function getTotalSavings(nds, incomeTaxSavings) {
  return nds + incomeTaxSavings;
}

/* Функция расчета "заплатит всего с авансом и выкупным"*/
function getContractSum(payment, nperiod, advancePayment, fv) {
  return payment * nperiod + advancePayment + fv;
}

/* Функция общей суммы финансирования*/
function getTotalFinancingSum(cost, advancePayment) {
  return cost - advancePayment;
}

/* Функция расчета переплаты*/
function getOverpaymentValue(payment, nperiod, advancePayment, fv, cost) {
  return payment * nperiod + advancePayment + fv - cost;
}

/*Функция преобразования к виду 1 000 000*/
function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/*Функция получения правильного окончания*/
// https://ru.stackoverflow.com/questions/1065436/Как-сделать-правильные-окончания-слов
function morph(int, array) {
  return (
    (array = array || ["период", "периода", "периодов"]) &&
    array[
      int % 100 > 4 && int % 100 < 20
        ? 2
        : [2, 0, 1, 1, 1, 2][int % 10 < 5 ? int % 10 : 5]
    ]
  );
}

function isInteger(s) {
  return /^\d+$/.test(s);
}

// поставить курсор в конец текста
function setCursorCaret(target) {
  let range = document.createRange(),
    sel = window.getSelection();

  range.selectNodeContents(target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
