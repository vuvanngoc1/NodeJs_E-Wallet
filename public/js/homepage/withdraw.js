const withDrawCardnumber = document.querySelector('#withDrawCardnumber');
const withDrawExpiry = document.querySelector('#withDrawExpiry');
const withDrawCvvcode = document.querySelector('#withDrawCvvcode');
const withDrawNote = document.querySelector('#withDrawNote');
const withDrawBtn = document.querySelector('#withDrawBtn');
const withDrawError = document.querySelector('#withDrawError');
const withDrawAmount = document.querySelector('#withDrawAmount');

const withDawHandlers = {
    validation(){
        withDrawBtn.addEventListener('click', () =>{
            const cardnumber = withDrawCardnumber.value;
            const expiry = withDrawExpiry.value;
            const cvvcode = withDrawCvvcode.value;
            const note = withDrawNote.value;
            const withDrawMoney = withDrawAmount.value;
            const username = document.querySelector('#usernameOfThisAccount').value;
            const password = document.querySelector('#passwordOfThisAccount').value;
            
            fetch("http://localhost:8080/CheckCreditCard",{
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({cardnumber,expiry,cvvcode,note,username,password,withDrawMoney,note})
                    })
                    .then((res)=>res.json())
                    .then((data)=>{
                        if(data){
                            if(data.code == 0){
                                withDrawError.innerText = '';
                                document.querySelector('#withdrawSuccessModal__inner').innerText = data.msg;
                                document.querySelector('#openWithdrawDialog').click();
                            }else{
                                withDrawError.innerText = data.msg;
                            }
                        }
                    })
        })  
    },
    formatMoney(){
        const formatMoneyWithDraw = document.querySelector('#formatMoneyWithDraw');
        const formatFeeWithDraw = document.querySelector('#formatFeeWithDraw');
        formatMoneyWithDraw.disabled = true;
        formatFeeWithDraw.disabled = true;

        withDrawAmount.addEventListener('input',()=>{
            const fee = (withDrawAmount.value/100)*5;

            formatMoneyWithDraw.value = `The amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withDrawAmount.value*1)}`;
            formatFeeWithDraw.value = `Transaction fee: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee)}`;
        });
    },
    start(){
        this.validation();
        this.formatMoney();
    }
};

withDawHandlers.start();