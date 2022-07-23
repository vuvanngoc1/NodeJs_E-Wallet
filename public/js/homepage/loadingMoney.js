const cardNumberInput = document.querySelector('#cardNumber');
const CVVCodeInput = document.querySelector('#CVVCode');
const expiryInput = document.querySelector('#expiry');
const rechargeMoneyBtn = document.querySelector('#rechargeMoneyBtn');
const moneyRechargeInput = document.querySelector('#moneyRecharge');
const emailUser = document.querySelector('#emailUser').innerText;

if(cardNumberInput){
    const rechargeHandler={
        onRecharge(){
            rechargeMoneyBtn.addEventListener('click', ()=>{
                const cardNumber = cardNumberInput.value;
                const CVVCode = CVVCodeInput.value;
                const expiry = `${expiryInput.value.split('-')[2]}/${expiryInput.value.split('-')[1]}/${expiryInput.value.split('-')[0]}`;
                const errorMsgLoadingMoney = document.querySelector('#errorMsgLoadingMoney');
                const moneyRecharge = moneyRechargeInput.value;

                const msg = rechargeHandler.validation(cardNumber,expiry,CVVCode,moneyRecharge);

                if(msg != ''){
                    errorMsgLoadingMoney.innerText = msg;
                }else{
                    errorMsgLoadingMoney.innerHTML = '';

                    fetch("http://localhost:8080/loadingMoney",{
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({cardnumber: cardNumber,expiry: expiry,cvvcode: CVVCode,moneyRecharge,emailUser})
                    })
                    .then((res)=>res.json())
                    .then(data=>{
                        if(data.code != 0){
                            errorMsgLoadingMoney.innerHTML = data.message;
                        }else{
                            errorMsgLoadingMoney.innerHTML = '';
                            document.querySelector('#openRechargeDialog').click();
                        }
                    })
                    .catch((err)=>console.log(err))
                }
            })
        },
        validation(cardNumber,expiry,CVVCode,moneyRecharge){
            let msg = '';
            if(cardNumber.length == 0 || expiry == 'undefined/undefined/' || CVVCode.length == 0 || moneyRecharge.length == 0){
                msg = 'You must enter all fields';
                return msg;
            }else{
                if(cardNumber.length !== 6){
                    msg = 'Card number must be 6 digits';
                    return msg;
                }
                if(CVVCode.length !== 3){
                    msg = 'Card number must be 3 digits';
                    return msg;
                }
            }

            return msg;
        },
        resetPageHome(){
            const usernameOfThisAccount = document.getElementById('usernameOfThisAccount').value;
            const passwordOfThisAccount = document.getElementById('passwordOfThisAccount').value;

            console.log(usernameOfThisAccount,passwordOfThisAccount);

            fetch('http://localhost:8080/resetPageHome',{
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: usernameOfThisAccount,password:passwordOfThisAccount})
            })
        },
        confirmRechargeDialogHandler(){
            const confirmRechargeDialog = document.querySelector('#confirmRechargeDialog');

            confirmRechargeDialog.addEventListener('click',()=>{
                rechargeHandler.resetPageHome();
            })
        }
        ,
        moneyHandler(){
            const formatMoney = document.getElementById('formatMoney');
            const moneyRecharge = document.getElementById('moneyRecharge');

            formatMoney.disabled = true;

            moneyRecharge.addEventListener('input',()=>{
                formatMoney.classList.remove('.text-danger');
                let vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(moneyRecharge.value*1);
                formatMoney.value = `The amount: ${vnd}`;
            })
        },
        start(){
            this.onRecharge();
            this.confirmRechargeDialogHandler();
            this.moneyHandler();
        }
    }

    rechargeHandler.start();
}

