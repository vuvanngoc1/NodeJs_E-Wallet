const phoneTransaction = document.querySelector('#phoneTransaction');
const receiver = document.querySelector('#receiver');
const moneyTransaction = document.querySelector('#moneyTransaction');
const msgTransaction = document.querySelector('#msgTransaction');
const btnTransaction = document.querySelector('#btnTransaction');
const sendPer = document.querySelector('#sendPer');
const receivePer = document.querySelector('#receivePer');
const eU = document.querySelector('#emailUser');

const transactionHandler = {
    receiverHandle(){
        phoneTransaction.addEventListener('blur',()=>{
            const phone = phoneTransaction.value;

            fetch("http://localhost:8080/receiver",{
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({phone})
            })
            .then(response => response.json())
            .then((result)=>{
                if(result.code==0){
                    receiver.classList.remove('text-danger');
                    receiver.innerText = result.msg;
                }else{
                    receiver.classList.add('text-danger');
                    receiver.innerText = result.msg;
                    transactionHandler.valid = false;
                }
            })
        })
    },
    onSubmit(){
        btnTransaction.addEventListener('click', ()=>{
            const transactionError = document.getElementById('transactionError')
            const money = moneyTransaction.value;
            const balance = document.getElementById('balance').innerText;
            const bl = document.getElementById('bl');
            
            if(receiver.innerText != 'This user was not found'){
                if(receivePer.checked == false && sendPer.checked == false){
                    transactionError.innerText = "Please choose fee bearer";
                }else{
                    const blInNum = bl.value*1;
                    const totalFee = money*1 + (money/100)*5;
                    
                    if(blInNum < totalFee){
                        transactionError.innerText = "The balance is not enough";
                    }else{
                        transactionHandler.OTPDialogHandler();
                    }
                }
            }else{
                transactionError.innerText = "Please check your phone number before transferring money";
            }
        })
    },
    OTPDialogHandler(msg){
        const openOTPDialog = document.getElementById('openOTPDialog');
        transactionHandler.timeRemaining();

        fetch('http://localhost:8080/getOTP',{
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: eU.innerText})
        })
        .then((response) =>response.json())
        .then((result)=>{
            if(result){
                const OTP = result.OTP;
                transactionHandler.OTPSubmit(OTP);
            }
        })

        openOTPDialog.click();
        openOTPDialog.addEventListener('click',()=>{
            document.getElementById('sendOTP').disabled = false;
            document.querySelector('#OTPError').innerText = "";
        })
    },
    OTPSubmit(OTP){
        const sendOTP = document.getElementById('sendOTP');
        const OTPTransfer = document.querySelector('#OTPTransfer');
        const OTPError = document.querySelector('#OTPError');

        sendOTP.addEventListener('click',()=>{
            if(OTPTransfer.value == ''){
                OTPError.innerText = "Please enter OTP code";
            }else if(OTPTransfer.value.length != 6){
                OTPError.innerText = "OTP code must be 6 digits";
            }else{
                if(OTP == OTPTransfer.value){

                    const username = document.getElementById('usernameOfThisAccount').value;
                    const password = document.getElementById('passwordOfThisAccount').value;
                    const feeBearer = sendPer.checked;
                    const phone = phoneTransaction.value;
                    const money = moneyTransaction.value;
                    const msg = msgTransaction.value;

                    fetch("http://localhost:8080/transaction",{
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({phone,money,msg,feeBearer,username,password,sender: document.querySelector('#fullname').innerText,receiver:receiver.innerText})
                    })
                    .then(response => response.json())
                    .then(result =>{
                        if(result.code != 0 && result.code != 10){
                            transactionError.innerText = result.msg;
                        }else{
                            if(result.code == 10){
                                transactionError.innerText = "";
                                document.querySelector('#openTransferSuccessDialog').click();
                                document.querySelector('#transferSuccessModal__inner').innerText = result.msg;
                            }else{
                                transactionError.innerText = "";
                                document.querySelector('#openTransferSuccessDialog').click();
                                document.querySelector('#transferSuccessModal__inner').innerText = result.msg;
                            }
                        }
                    })
                    document.querySelector('#closeOTPModal').click();
                    
                }else{
                    OTPError.innerText = "Wrong OTP";
                }
            }
        })
    },
    timeRemaining(){
        const TimeRemaingOTP = document.getElementById('TimeRemaingOTP');
        let i = 60;

        const t = setInterval(() =>{
            if(i>=0){
                TimeRemaingOTP.innerText = i;
                i--;
            }else{
                clearInterval(t);
                document.querySelector('#OTPTransfer').value = '';
                document.getElementById('sendOTP').disabled = true;
                document.querySelector('#OTPError').innerText = "Time is out, please try again";
            }
        },1000)

        const closeOTPModal = document.querySelector('#closeOTPModal');

        closeOTPModal.addEventListener('click',()=>{
            clearInterval(t);
            document.querySelector('#TimeRemaingOTP').innerText = '60';
            document.getElementById('sendOTP').disabled = false;
            document.querySelector('#OTPError').innerText = "";
            document.querySelector('#OTPTransfer').value = '';
        })

        document.querySelector('#getOTPModal').addEventListener('click',()=>{
            clearInterval(t);
            document.querySelector('#TimeRemaingOTP').innerText = '60';
            document.getElementById('sendOTP').disabled = false;
            document.querySelector('#OTPError').innerText = "";
            document.querySelector('#OTPTransfer').value = '';
        })
    },
    formatMoney(){
        const formatMoneyTransfer = document.querySelector('#formatMoneyTransfer');
        const formatFeeTransfer = document.querySelector('#formatFeeTransfer');
        formatMoneyTransfer.disabled = true;
        formatFeeTransfer.disabled = true;

        moneyTransaction.addEventListener('input',()=>{
            const fee = (moneyTransaction.value/100)*5;

            formatMoneyTransfer.value = `The amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(moneyTransaction.value*1)}`;
            formatFeeTransfer.value = `Transaction fee: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee)}`;
        });
    },
    start(){
        this.receiverHandle();
        this.onSubmit();
        this.formatMoney();
    }
}

transactionHandler.start();