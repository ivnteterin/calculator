const input = document.querySelector('.digits');
const memory = document.querySelector('.memory');

const clearAll = document.getElementById('clear-all');
const clearEntry = document.getElementById('clear-entry');

const sqrtBtn = document.getElementById('sqrt');
const plus = document.getElementById('sum');
const minus = document.getElementById('minus');
const mult = document.getElementById('mul');
const div = document.getElementById('div');
const equal = document.getElementById('equal');

const numBtns = document.querySelectorAll('.num');
const ctrlBtns = Array.from(document.querySelectorAll('.ctrl'));

// global vars

let curr=0, prev=0, action="", readyFor2ndInput=false, prevAction="", isSequential=true, err=null;

// end of global vars

// all inputs be it typed or clicked come through here

const newInput = (e) => {
  checkForErr();
  checkLength(curr);
  // console.log(e.data || e.target.value);
  if (/^[eE\^\/\*+-]/.test(e.data)){newAction(e);return;} //handle typed controls.

  if (e.inputType =="deleteContentBackward") { clearEntry.click(); return; } //if backspace pressed  
  if (action && readyFor2ndInput && !curr<0) { curr=0; readyFor2ndInput=false; }
  const pressedVal=e.target.innerHTML || e.target.value.toString().split("").pop();
  addToInput(pressedVal);
}

//gets added to main input as number is being typed out or clicked

const addToInput = (num)=> {
    isNaN(num) || curr.toString().length > 14 ? curr : curr+=num;
    num==0 && curr.toString().includes(".") ? curr : curr=Number(curr);
    if (num=="-") curr=num;
    if (num==".") curr+=num;
    updateInput();
  }

const updateInput = () => {
  if(curr==Infinity) {invalidInput("Value too big"); return;};
  // console.log("UPDATE curr "+curr);
  curr.toString().includes(".") && curr.toString().length <15 ? input.value=curr : input.value = checkLength(trimResult(curr,15));
  if(err) invalidInput("Value too big");

  //if number is large
  curr.toString().includes("e+") ? curr=Number(curr.toString()) : curr;
  if(Number(curr.toString().split("e+")[1]<100)) {
  curr.toString().includes("e+") ? curr=(Number(curr.toString().split("e+")[0])).toPrecision(Number(curr.toString().split("e+")[1])).split(".").join(""): curr;
  }
  checkLength(curr);
  };

const trimResult = (num,toLength) => {
    let x=num.toString().length; 
    let newNum=Number(num); 
    while(newNum.toString().length>toLength) {
      newNum=Number(num).toExponential(x--);
    }
    return newNum;
}

const trimMemory = (signStr)=> {
  // console.log(memory.innerHTML.length);
  // console.log("memory.innerHTML "+memory.innerHTML);
  let x=memory.innerHTML;
  let newX=[];
  if(x.length>20) {
    x=x.split(/[=\^\/\*+-]/);
    newX = x.map(num=> {
    let y=num.length;
    let newNum=Number(num);
      while(newNum.toString().length>7) {
        newNum=Number(num).toExponential(y--);
      }
      newNum = "("+ newNum.toString() + ")";
      return newNum;
   
  });
  newX.pop();
  // console.log("x "+x);
  let modifiedMemoryOutput  = memory.innerHTML;
  if (!isSequential) {
  memory.innerHTML= (isNaN(newX[0]) ? (trimResult(x[0],8) || (modifiedMemoryOutput.toString().split("+")[0] +"+" + modifiedMemoryOutput.toString().split("e+")[1].split(/[=\^\/\*+-]/)[0])) : newX[0]) + `&nbsp;`+signStr+`&nbsp;` + newX[newX.length-1] +"=";
  } else {
    memory.innerHTML = trimResult(x[0],8)+"=";
  }
}
}

const checkLength = (num)=> {
  const inputVal = input.value;
  inputVal.length > 11 ? input.style.fontSize="2.6rem" : input.style.fontSize="3.3rem";
  return num;
}

document.addEventListener("keydown", deleteClick);
function deleteClick(e) { 
  if (e.keyCode == 46)  { 
  e.preventDefault();
  removeLastDigit();}
  if (e.keyCode==67 || e.keyCode==27) {
    clearAll.click();
  }
  if (e.keyCode==83) {
    e.preventDefault();
    sqrtBtn.click();
  }
  if (e.keyCode <91 && e.keyCode > 64 && e.keyCode != 69 && e.keyCode != 83) {
    e.preventDefault();} 
  } //if delete button pressed


const newAction = (e)=> {
  const sign=e.data || e.target.id;
  const minusPressed = sign=="-" || sign=="minus";

  
  if(curr=="-" && !minusPressed) { curr=0;}

  if (action && minusPressed && !curr) { // *+/ and -
    addToInput("-");
    return;
  }

  if (action && curr && isSequential) {calculateIt();readyFor2ndInput = true;};
  isSequential=true;
  
  let signFromTypedInput = e.data;
  if (signFromTypedInput=="/") signFromTypedInput="÷";
  if (signFromTypedInput=="e" || signFromTypedInput=="E") signFromTypedInput="^";
  action=signFromTypedInput || e.target.id;
  updateInput();
  if(curr!=0 && !isNaN(curr)) {
    prev=curr;
    curr=0;
  }
  let updatedSign = e.target.innerHTML == "×" ? "*" : e.target.innerHTML;
  if (updatedSign == "y") { updatedSign="^"; action="pow"};
  memory.innerHTML= prev + (signFromTypedInput || (action=="pow" ? "^" : updatedSign));
  trimMemory(sign);

  readyFor2ndInput=true;
}

const calculateIt = () => {
  checkForErr();
  switch (action) {
    case 'sum':
    case "+":
      doExpression("+", sum);
      break;
    case "minus":
    case "-":
      doExpression("-", min);
      break;
    case "mul":
    case "*":
      doExpression("*", mul);
      break;
    case "div":
    case "÷":
      doExpression("÷", divd);
      break;
    case "pow":
    case "^":
      doExpression("^",pow);
      break;
    default:
      break;
  }
}

sqrtBtn.addEventListener("click",()=> {
  equal.click(); // in case there was chaining prior
  memory.innerHTML="√"+curr;
  curr = trimResult(sqrt(curr),15);

  if(isNaN(curr)) {
     invalidInput("Invalid input");
  } else {
    updateInput();
  }
});

equal.addEventListener("click", ()=> {isSequential=false; calculateIt()});
input.addEventListener("keypress", (e)=> {
if (e.key=="Enter"||e.key=="=" || e.key==" ") {
  e.preventDefault();
  equal.click()
}  
});

const doExpression = (signStr,whichFunc) => {
  if(memory.innerHTML.split("").pop() == "=") {  //if "=" or "Enter" pressed again
    memory.innerHTML=curr+signStr+prev+"=";
    if(signStr) trimMemory(signStr);
    curr = Math.round((whichFunc(curr,prev) + Number.EPSILON) * 1000000000) / 1000000000; // round to the nearest to prevent bugs like 2.7777777777779 etc.
    curr=trimResult(curr,15);
    updateInput();
   } else {
    let temp = curr; 
    curr = Math.round((whichFunc(prev,curr) + Number.EPSILON) * 1000000000) / 1000000000;
    prev=temp; 
    memory.innerHTML+=prev+"=";
    trimMemory(signStr);
    if (curr==Infinity) {
      invalidInput("Value too big");
      return;
    } else {
      trimResult(curr,15);
      updateInput();
    }
  }
  readyFor2ndInput = false;
}

const invalidInput = (errMsg)=> {
    input.value=err=errMsg;
    input.style.fontSize="2.5rem";
    input.style.color="#e26e6e";
    curr=0;
    // console.log("err");
}

const checkForErr = ()=> {
  if (err) {
    clearAll.click();
    err=null;
  }
}

ctrlBtns.forEach(ctrl=>ctrl.addEventListener("click", (e)=>newAction(e)));
numBtns.forEach(btn=>btn.addEventListener("click", newInput));
input.addEventListener("input", newInput);

clearAll.addEventListener("click",()=> {
  resetAll();
})

clearEntry.addEventListener("click",()=> {
  
  if(curr.toString().length <2 || isNaN(curr) || curr==Infinity) {
    curr=0;
    input.value="";
    return;}
    removeLastDigit();
    checkLength(curr);
})

const removeLastDigit = () => {
  if(isNaN(curr)) curr=0;
  curr = curr.toString().slice(0,-1);
  input.style.color="white"; 
  updateInput();
}

const resetAll = ()=> {
  curr=0;
  prev=0;
  action="";
  memory.innerHTML="";
  readyFor2ndInput=false;
  input.style.fontSize="3.3rem";
  input.style.color=""; 
  input.value="";
  checkLength(curr);
}

const sum = (a,b) => Number(a)+Number(b);
const min = (a,b) => a-b;
const mul = (a,b) => a*b;
const divd = (a,b) => a/b;
const sqrt = (a) => Math.round(Math.sqrt(a) * 100000000) / 100000000;
const pow = (a,b) => Math.pow(a,b);

//CONSOLE LOGS

// window.addEventListener("input",()=> {
//   LogInfo();
// })

// window.addEventListener("click",()=> {
//   LogInfo();
// })


// const LogInfo = ()=> {
//   console.log("{ CURRENT STATE")
//   console.log("curr = "+curr);
//   console.log("prev = "+prev);
//   console.log("action = "+action);
//   console.log("readyFor2ndInput = "+readyFor2ndInput);
//   console.log("isSequential = "+isSequential);
//   console.log(" }");
// }