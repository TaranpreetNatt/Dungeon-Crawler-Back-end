const email = document.getElementById("email").value;
const name = document.getElementById("name").value;
const password = document.getElementById("password").value;

//https://dungeon-crawler-back-end.herokuapp.com/auth/register

// document.getElementById("regist").addEventListener("click", myFunction);
//
// function myFunction() {
//   document.getElementById("regist").innerHTML = "Sign Up Successful!";
// }

const regBtn = document.getElementById("registerBtn");

regBtn.onclick = function(){
    console.log(name);
}
