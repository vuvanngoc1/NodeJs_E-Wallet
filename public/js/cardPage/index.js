const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

const radio1 = document.getElementById('signup');
const radio2 = document.getElementById('login');
radio1.disabled = true;
radio2.disabled = true;

let cartCardsIntext = [];
let cartCardsInNum = [];
const cardPrices = document.querySelectorAll('.cardPrice');
const cardPrice_carts = document.querySelectorAll('.cardPrice');
const cartItem = document.querySelector('.cartItem');


cardPrices.forEach((item)=>{
    item.addEventListener('click',(e)=>{
        const price = item.innerText.split('.')[0]+item.innerText.split('.')[1];
        if(cartCardsIntext.length <= 4){
            cartCardsInNum.push(price);
            cartCardsIntext.push(item.innerText);
            render();
        }else{
            document.getElementById('errorMsg').style.color = 'red';
            document.getElementById('errorMsg').innerText='Can only buy up to 5 cards'
        }
    })   
})
const render = ()=>{
    const htmls = cartCardsIntext.map((price,index)=>{
        return `
        <div num="${index}" class="cardPrice_cart">${price}
            <svg num="${index}" class="deleteCartItem d-none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>
        `
    });
    cartItem.innerHTML = htmls.join('');
    carHandle();
    deleteCard();
}
const carHandle = ()=>{
    const deleteCartItems = document.querySelectorAll('.deleteCartItem');
    const cardsInCart = document.querySelectorAll('.cardPrice_cart');
    if(cardsInCart){
        cardsInCart.forEach((item,index)=>{
            item.addEventListener('mouseover',(e)=>{
                deleteCartItems.forEach((deleteCartItem)=>{
                    if(deleteCartItem.getAttribute('num') == index){
                        deleteCartItem.classList.remove('d-none');
                    }
                })
            })
    
            item.addEventListener('mouseout',()=>{
                deleteCartItems.forEach((deleteCartItem)=>{
                    if(deleteCartItem.getAttribute('num') == index){
                        deleteCartItem.classList.add('d-none');
                    }
                })
            })
        })
    }
}

const deleteCard = ()=>{
    const deleteCartItems = document.querySelectorAll('.deleteCartItem');

    deleteCartItems.forEach((item,deleteCartItemIndex)=>{
        item.addEventListener('click',()=>{
            cartCardsIntext = cartCardsIntext.filter((item,index) => index !== deleteCartItemIndex);
            cartCardsInNum = cartCardsInNum.filter((item,index) => index !== deleteCartItemIndex);
            console.log(cartCardsIntext)
            render();
        })
    })
}


const buyBtn = document.querySelector('#buyBtn');
const formBuy = document.querySelector('#formBuy');
formBuy.addEventListener('submit', (e) => {
    e.preventDefault();
})


buyBtn.addEventListener('click', (e) => {
    if(cartCardsInNum.length == 0){
        document.getElementById('errorMsg').style.color = 'red';
        document.getElementById('errorMsg').innerText='Cart is empty';
    }else{
        document.getElementById('errorMsg').innerText='';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        let charge = 0;
        cartCardsInNum.forEach((item)=>{
            charge += item*1;
        })

        const IDCards = renderInf();

        fetch("http://localhost:8080/checkBalence",{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    IDCards,
                    charge,
                    username,
                    password
                })
        })
        .then((response)=>response.json())
        .then(result=>{
            if(result){
                if(result.code == 0){
                    sileHandler.sileInf();
                    signupBtn.click()
                    radio1.checked = true;
                    radio1.disabled = true;
                    radio2.disabled = true;
                }else{
                    document.getElementById('errorMsg').style.color = 'red';
                    document.getElementById('errorMsg').innerText=result.msg;
                }
            }
        })
    }
})

const renderInf = ()=>{
    const cardName = document.getElementById('homeNetwork').innerText;

    let IDS = [];
    let ID = '';
    const htmls = cartCardsIntext.map((item)=>{
        if(cardName == 'Vinaphone'){
            ID = `33333${generateOTP()}`
        }else if(cardName == 'Mobifone'){
            ID = `22222${generateOTP()}`
        }else if(cardName == 'Viettel'){
            ID = `11111${generateOTP()}`
        }
        IDS.push(ID);
        return `
            <div>${item}:</div>
            <input type="text" value="ID: ${ID}" disabled>
        `;
    })

    IDsCard.innerHTML = htmls.join('');

    return IDS;
}

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 5; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}


const sileHandler = {
    sileBuyCard(){
        loginBtn.onclick = ()=>{
        loginForm.style.marginLeft = "0%";
        loginText.style.marginLeft = "0%";
        };
    },
    sileInf(){
        signupBtn.onclick = ()=>{
        loginForm.style.marginLeft = "-50%";
        loginText.style.marginLeft = "-50%";
        };
    }
}




