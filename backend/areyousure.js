const btn1 = document.getElementById("enableBtn1");
const btn2 = document.getElementById("enableBtn2");
const btn3 = document.getElementById("enableBtn3");
const btn4 = document.getElementById("enableBtn4");
const delBtn = document.getElementById("deleteAcctBtn");

btn1.addEventListener("click", () => {
    btn2.disabled = false;
});

btn2.addEventListener("click", () => {
    btn3.disabled = false;
});

btn3.addEventListener("click", () => {
    btn4.disabled = false;
});

btn4.addEventListener("click", () => {
    delBtn.disabled = false;
});