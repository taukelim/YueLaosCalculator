/*=============================================
=            LOGIC            =
=============================================*/
/*User Inputs*/
const nameField = function () {
  return [...document.querySelectorAll('#nameValue')];
};
const ratingField = function () {
  return [...document.querySelectorAll('#ratingValue')];
};
const name_and_rating_field = function () {
  return nameField().map((e, i) => [e.value, ratingField()[i].value]);
};
const numberOfDates = function () {
  return name_and_rating_field().length;
};

/*Dating Pool*/
const startingPop = 10000; //number of people you meet in your life
const datingPool = function (startingPopulation) {
  /*General Filter*/
  const popGeneralFilter = function (population) {
    let percentagesDictionary = [
      ['oppositeGenderPercentage', 50],
      ['lgbtPercentage', 4],
      ['bottomPercentage', 20],
      ['personalPreferancePercentage', 20],
    ];

    //Whittle down population with each percentaged from percentagesDictionary
    for (let i = 0; i < percentagesDictionary.length; i++) {
      population = population * ((100 - percentagesDictionary[i][1]) / 100);
    }

    return population;
  };

  /*Attractiveness filter*/
  const attractivenessFilter = function (population) {
    /* Get Male Metrics */
    let maleData = (function () {
      let r = {
        height: Number(document.getElementById('heightValue').value),
        age: Number(document.getElementById('ageValue').value),
        education: Number(document.getElementById('educationValue').value),
        income: Number(document.getElementById('incomeValue').value),
      };

      return r;
    })();

    //Ancillary function : get percentile from Z scores
    const getP = function (z) {
      if (z < -6.5) return 0.0;
      if (z > 6.5) return 1.0;

      let factK = 1;
      let sum = 0;
      let term = 1;
      let k = 0;
      let loopStop = Math.exp(-23);
      while (Math.abs(term) > loopStop) {
        term =
          (((0.3989422804 * Math.pow(-1, k) * Math.pow(z, k)) /
            (2 * k + 1) /
            Math.pow(2, k)) *
            Math.pow(z, k + 1)) /
          factK;
        sum += term;
        k++;
        factK *= k;
      }
      sum += 0.5;

      return sum;
    };

    /* Declare Attractiveness Filters*/ //In the future can make it into object with methods

    function heightPerc(height) {
      //mean and sd is based on the normal distribution for girls heights based on 27/3/2022 survey
      let sd = 6;
      let mean = 159;

      //-8 because girls demand a minimum 8cm taller, which means you can only start to date girls 8cm shorter than you
      let tallestPossibleHeight = height - 8;
      //No girls shorter than 145cm for now
      let shortestPossibleHeight = (height) =>
        height - 25 < 145 ? 145 : height - 25;

      //tallest and shortest Z scores
      let n1 = Math.round(((tallestPossibleHeight - mean) / sd) * 100) / 100;
      let n2 =
        Math.round(((shortestPossibleHeight(height) - mean) / sd) * 100) / 100;

      //return percentage between tallest and shortest datetable heights
      //minimum percentage 0.01 to negative percentages
      return Math.round((getP(n1) - getP(n2)) * 100) < 1
        ? 0.01
        : Math.round((getP(n1) - getP(n2)) * 100);
    }

    function ageMarriedPerc(age) {
      //algo summary: get percentage by the sum of all the age specific umarried percentages over the maximum available sum

      //get percentage umarried based on age
      function getPerc(age) {
        //data from....
        let agePerc = {
          18: 98,
          19: 96,
          20: 96,
          21: 94,
          22: 91,
          23: 81,
          24: 78,
          25: 70,
          26: 60,
          27: 53,
          28: 45,
          29: 39,
          30: 33,
          31: 29,
          32: 25,
          33: 21,
          34: 19,
          35: 16,
          36: 15,
          37: 13,
          38: 14,
          39: 13,
          40: 12,
          41: 10,
          42: 10,
          43: 9,
          44: 9,
          45: 11,
          46: 9,
          47: 9,
          48: 9,
          49: 9,
          50: 9,
          51: 8,
        };

        return age < 18 ? 100 : agePerc[age];
      }

      let holder = [];
      //this algo is quite flawed but the best we have for now, it will be wonky on even or odd numbers because of the division of 2
      let minimumAge = Math.floor(age / 2 + 7);
      //you can date a women one year older than you
      let startingAge = age + 1;
      let max = 100 * (startingAge + 1 - minimumAge); //100% * age range

      //loop through age range
      for (let i = startingAge; i >= minimumAge; i--) {
        holder.push(getPerc(i));
      }

      //sum of all the percentages gotten from each age in the range
      holder = holder.reduce((a, b) => a + b);

      return Math.round((holder / max) * 10000) / 100;
    }

    function ageDemographicPerc(age) {
      const minAge = Math.floor(age / 2 + 7);
      const maxAge = age + 1;
      //data from united nations escap : Percentage of total population by age group and sex,
      //assuming percentage of age group is equally distributed by each age, we get 0.85% - 1% of the population for each age
      //rounding up all the percetages e.g 0.85% = 1%
      //future upgrading will remove this rounding up to give slightly more accurate number
      return maxAge - minAge;
    }

    function edPerc(edScore) {
      //mean and sd is based on the normal distribution for girls minimum education requirement in a guy
      let sd = 1.24;
      let mean = 3.19;

      //Z scores
      let n1 = Math.round(((edScore - mean) / sd) * 100) / 100;

      //return percentage between
      //minimum percentage 0.01 to negative percentages

      return Math.round(getP(n1) * 100);
    }

    function incPerc(income) {
      const income_and_percentage = {
        200: 8.82,
        300: 14.71,
        400: 20.59,
        500: 26.47,
        600: 44.12,
        700: 45.01,
        800: 50,
        900: 61.76,
        1000: 64.71,
        1100: 76.47,
        1200: 82.4722973,
      };

      let basePercentage = Math.round(32.14285714 * 100) / 100;
      let yesPercentage = Math.round(67.85714286 * 100) / 100;
      income = Math.floor(income / 100) * 100;

      if (income < 200) return basePercentage;
      if (income >= 1300) return 100;
      return Math.round(
        (income_and_percentage[income] / 100) * yesPercentage + basePercentage
      );
    }

    /* Set Up Sieve by returning object with percentages based on metrics */
    function initializeSieve(height, age, education, income) {
      let r = {};

      r['heightPerc'] = heightPerc(height);
      r['ageMarriedPerc'] = ageMarriedPerc(age);
      r['ageDemographicPerc'] = ageDemographicPerc(age);
      r['educationPerc'] = edPerc(education);
      r['incomePerc'] = incPerc(income);

      return r;
    }

    /* Call and Store Sieve Data */
    let sievePercentages = initializeSieve(
      maleData['height'],
      maleData['age'],
      maleData['education'],
      maleData['income']
    );

    /*Turn sieve into array*/
    let sievePercentagesArray = Object.entries(sievePercentages);

    /* Apply sieve to general filtered population*/
    for (let i = 0; i < sievePercentagesArray.length; i++) {
      population = population * (sievePercentagesArray[i][1] / 100);
    }

    /*Return population after double filtration*/
    return population < 1 ? 1 : Math.round(population);
  };

  /*Apply both filters*/
  const doubleFilteredDatingPool = attractivenessFilter(
    popGeneralFilter(startingPopulation)
  );

  return doubleFilteredDatingPool < 1 ? 1 : doubleFilteredDatingPool;
};

/*Logic*/
function logic(datingPool) {
  const thirtySevenPercent = Math.round(datingPool * (1 / Math.E));
  const firstPool = name_and_rating_field().slice(0, thirtySevenPercent);
  const secondPool = name_and_rating_field().slice(
    thirtySevenPercent,
    numberOfDates()
  );

  if (datingPool < 3) {
    return `The first person that is interested in you, is your True Love.`;
  }

  if (numberOfDates() >= thirtySevenPercent) {
    /*Benchmark candidate = the best person(s) in the 37% pool*/
    //return format [ [ 'name', 9 ] ]
    const benchmark = (function (pool) {
      let highestRating = Math.max(...pool.map((e) => e[1])).toString();
      return pool.filter((e) => e[1] === highestRating);
    })(firstPool);

    /*Is True Love found?*/
    /*Returns the first pair that is >= benchmark (true love), else returns string mentioning next pair better than benchmark is true love*/
    const checkTrueLoveInSecondPool = (function () {
      let firstMatch = [];
      for (let i = 0; i < secondPool.length; i++) {
        //If arrays are empty there will be error
        if (Number(secondPool[i][1]) >= Number(benchmark[0][1])) {
          firstMatch = secondPool[i];
          break;
        }
      }
      //If there is a person surpassing benchmark, that person is the One
      //Else inform that the next person passing the benchmark is the One
      return firstMatch.length > 0
        ? `${firstMatch[0]} is your True Love`
        : `The next person better than ${
            benchmark[benchmark.length - 1][0]
          } is your True Love.`;
    })();

    return checkTrueLoveInSecondPool;
  }

  if (numberOfDates() < thirtySevenPercent) {
    return `Your True Love is not found. 
    Based on your dating history, they start to appear after ${
      thirtySevenPercent - numberOfDates()
    } more relationships.`;
  }
}

/*Display Results*/
function finalResult() {
  //Get custom dating pool
  let customDatingPool = datingPool(startingPop);

  //Plug into logic where it combines with dating history
  let result = logic(customDatingPool);

  //display result to html
  document.getElementById(
    'yourDatingPool'
  ).innerText = `My intuition tells me that ${customDatingPool} people might be interested in you.`;
  document.getElementById('finalResult').innerText = result;
}

/*=============================================
=            General Functionality            =
=============================================*/

function addField() {
  let original = document.getElementById('inputRow');
  let clone = original.cloneNode(true);

  //Remove clear fields before adding
  clone.getElementsByTagName('input')[0].value = '';
  // clone.getElementsByTagName('input')[1].value = '';

  clone.id = 'inputRow';
  original.parentNode.appendChild(clone);
}

function displayAboutMeForm() {
  validateRatings();
  let e = document.getElementById('aboutMeFormContainer');

  e.style.display === 'none'
    ? (e.style.display = 'block')
    : (e.style.display = 'none');
}

function deleteField() {
  validateRatings();
  let button = document.querySelectorAll('#xIcon');
  let inp = document.querySelectorAll('#inputRow');

  if (inp.length === 1) {
    inp[0].getElementsByTagName('input')[0].className += ' invalid';
    document.getElementById('ratingValue').className += ' invalid';
    setTimeout(function rm() {
      //remove border after 3 seconds
      inp[0].getElementsByTagName('input')[0].classList.remove('invalid');
      document.getElementById('ratingValue').classList.remove('invalid');
    }, 2000);
  } else {
    function remove() {
      let input_ = document.querySelectorAll('#inputRow');
      if (input_.length === 1) {
        input_[0].getElementsByTagName('input')[0].className += ' invalid';
        input_[0].getElementsByTagName('input')[1].className += ' invalid';
        setTimeout(function rm() {
          //remove border after 3 seconds
          input_[0]
            .getElementsByTagName('input')[0]
            .classList.remove('invalid');
          input_[0]
            .getElementsByTagName('input')[1]
            .classList.remove('invalid');
        }, 2000);
      } else {
        this.parentNode.parentNode.parentNode.parentNode.remove();
      }
    }

    for (let i = 0; i < inp.length; i++) {
      button[i].addEventListener('click', remove, false);
    }
  }
}

function validateDatesFieldForm() {
  validateRatings();
  let f = [...document.getElementsByClassName('field')];
  let valid = true;

  f.forEach((e) => {
    if (e.value === '') {
      //if field is empty
      e.className += ' invalid'; //Apply red border
      setTimeout(function rm() {
        //remove border after 3 seconds
        e.classList.remove('invalid');
      }, 3000);
      valid = false; //don't allow new field to be added
    }
  });

  if (valid) {
    addField();
  }

  return valid;
}

function validateRatings() {
  let r = [...document.getElementById('ratingValue')];

  r.forEach((e) => {
    if (e.value === '') {
      e.className += ' invalid'; //Apply red border
    } else {
      e.classList.remove('invalid');
    }
  });
}

/*FORM FUNCTIONALITY*/
let currentTab = 0; //global

document.addEventListener('DOMContentLoaded', function (event) {
  showTab(currentTab);
});

// functions that run on the final tab
function finalDisplay() {
  document.getElementById('calcBtn').style.display = 'none';
  document.getElementById('all-steps').style.display = 'none';
  document.getElementById('text-message-container').style.display = 'block';
}

function showTab(currentTab) {
  //current Tab is a number
  let allTabs = document.getElementsByClassName('tab');

  //show tab according to variable currentTab's number
  allTabs[currentTab].style.display = 'block';

  /*HIDE OR SHOW BACK BUTTON*/
  //if it's the first tab, hide the back button
  if (currentTab == 0) {
    document.getElementById('prevBtn').style.display = 'none';
  } else {
    //else show previous button
    document.getElementById('prevBtn').style.display = 'inline';
  }

  fixStepIndicator(currentTab);
}

function validateForm() {
  let x = document.getElementsByClassName('tab');
  let y = x[currentTab].getElementsByTagName('input');
  let i;
  let valid = true;

  //If there's no input tag...
  if ([...y].length == 0) {
    y = x[currentTab].getElementsByTagName('select');

    for (i = 0; i < y.length; i++) {
      //if any input field of currentTab is empty apply class 'invalid' and change valid to false
      if (y[i].value == 'false') {
        y[i].className += ' invalid';
        valid = false;
      }
    }
  }
  //Else (it should be input tag)
  else {
    for (i = 0; i < y.length; i++) {
      //if any input field of currentTab is empty apply class 'invalid' and change valid to false
      if (y[i].value == '') {
        y[i].className += ' invalid';
        valid = false;
      }
    }
  }

  if (valid) {
    // if valid is true apply class 'finish' to elements with classname 'step' in currentTab
    document.getElementsByClassName('step')[currentTab].className += ' finish';
  }

  return valid;
}

function nextPrev(n) {
  //get elements of class "tab" into array-like, assign it to x
  let allTabs = document.getElementsByClassName('tab');

  //You can't go to the next tab unless validate form return true
  //validateForm return bollean
  //if any input field of currentTab is empty apply class 'invalid'
  if (n == 1 && !validateForm()) return false;

  //hide current tab
  allTabs[currentTab].style.display = 'none';

  //nextPrev is called with a number argument 1 or -1 depending on the 'next' or 'prev' buttton clicked
  currentTab = currentTab + n;

  //One second last tab
  /*IF second last tab, change next button to calculate button*/
  if (currentTab == allTabs.length - 2) {
    //If button is already changed to calc, make sure it's shown
    //Need this code when they reach the final page which hides the calc button and they go back which needs the calc button to show again
    if (document.getElementById('calcBtn')) {
      document.getElementById('calcBtn').style.display = 'inline-block';
    }
    //If button is still right arrow, change it to calculate button
    if (document.getElementById('nextBtn')) {
      document.getElementById('nextBtn').innerHTML = 'Calculate!';
      document.getElementById('nextBtn').id = 'calcBtn';
    }
  } else if (currentTab >= allTabs.length - 1) {
    finalDisplay();
    finalResult();
  } else {
    if (document.getElementById('calcBtn')) {
      document.getElementById('calcBtn').innerHTML =
        '<i class="fa fa-angle-double-right" aria-hidden="true"></i>';
      document.getElementById('calcBtn').id = 'nextBtn';
    }
  }

  showTab(currentTab);
}

function fixStepIndicator(n) {
  //n is currentTab

  //steps are the icons at the top
  let allSteps = document.getElementsByClassName('step');

  //remove active class for all steps
  for (let i = 0; i < allSteps.length; i++) {
    allSteps[i].className = allSteps[i].className.replace(' active', '');
  }

  //apply active class to step
  allSteps[n].className += ' active';
}

// const nextBtnClick = document.querySelector('#nextBtn');
// const prevBtnClick = document.querySelector('#prevBtn');
// nextBtnClick.addEventListener('click', nextPrev(1));
// prevBtnClick.addEventListener('click', nextPrev(-1));

/*=============================================
=            TYPEWRITER            =
=============================================*/

var TxtType = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    // this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

  var that = this;
  var delta = 125 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

window.onload = function () {
  var elements = document.getElementsByClassName('typewrite');
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-type');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement('style');
  css.type = 'text/css';
  css.innerHTML = '.typewrite > .wrap { border-right: 0.08em solid #fff}';
  document.body.appendChild(css);
};

function autoFill() {
  let az = [
    'Abbey',
    'Bula',
    'Carey',
    'Devi',
    'Ella',
    'Fanny',
    'Gretchen',
    'Hilda',
    'Iva',
    'Jenny',
    'Kimmy',
    'Leila',
    'Majorie',
    'Niena',
    'Oja',
    'Pratiwi',
    'Queeny',
    'Risha',
    'Sasha',
    'Tiffany',
  ];

  for (let i = 0; i < az.length; i++) {
    document.querySelectorAll('#nameValue')[i].value = az[i];
    document.querySelectorAll('#ratingValue')[i].value = Math.floor(
      Math.random() * (10 - 1 + 1) + 1
    );

    if (i == az.length - 1) {
      break;
    } else {
      addField();
    }
  }
}

/*=============================================
=            NAV BAR            =
=============================================*/

const menuBtn = document.querySelector('.menu-icon span');
const searchBtn = document.querySelector('.search-icon');
const cancelBtn = document.querySelector('.cancel-icon');
const items = document.querySelector('.nav-items');
const form = document.querySelector('form');
menuBtn.onclick = () => {
  items.classList.add('active');
  menuBtn.classList.add('hide');
  searchBtn.classList.add('hide');
  cancelBtn.classList.add('show');
};
cancelBtn.onclick = () => {
  items.classList.remove('active');
  menuBtn.classList.remove('hide');
  searchBtn.classList.remove('hide');
  cancelBtn.classList.remove('show');
  form.classList.remove('active');
  cancelBtn.style.color = '#ff3d00';
};
searchBtn.onclick = () => {
  form.classList.add('active');
  searchBtn.classList.add('hide');
  cancelBtn.classList.add('show');
};
