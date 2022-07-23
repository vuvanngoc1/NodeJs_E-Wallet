const fullnameUser = document.getElementById('fullname');
const menuItems = document.querySelectorAll('.menuItem');
const itemContents = document.querySelectorAll('.itemContent');
const mainContent = document.querySelector('.main-content');
const addIDCard = document.querySelector('#addIDCard');
const verticalModalContent = document.querySelector('.verticalModalContent');

fetch("http://localhost:8080/API",
    {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'fullname':fullnameUser.innerText})
    }
  )
  .then((dt) => dt.json())
  .then(data=>{
      const status = data[0].status;

      if(status == 'Waiting for verification'){
        menuItems.forEach((item)=>{
            item.addEventListener('click',(e)=>{
                e.preventDefault();
            });
        })

        addIDCard.classList.add('d-none');
        verticalModalContent.innerText = 'This feature is only available for verified accounts';

        itemContents.forEach((item)=>{
            item.style.display = 'none';
        })

        mainContent.style.height = '100vh';
      }

      if(status == 'Request additional information'){
        menuItems.forEach((item)=>{
            item.addEventListener('click',(e)=>{
                e.preventDefault();
            });
        })

        addIDCard.classList.remove('d-none');
        verticalModalContent.innerText = 'Your British identity card is too fuzzy or not standard. You need to update your photo again to be able to verify your account.';

        itemContents.forEach((item)=>{
            item.style.display = 'none';
        })

        mainContent.style.height = '100vh';
      }
  })


const frontCard = document.querySelector('#frontCard');
const frontCardImg = document.querySelector('.frontCard');
const backCard = document.querySelector('#backCard');
const backCardImg = document.querySelector('.backCard');
let frontIdCard = '',backIdCard = '';

frontCard.addEventListener('change', (e) => {
    const fileTarget = e.target.files[0];
    if(fileTarget){
        const reader = new FileReader();
        reader.readAsDataURL(fileTarget);
        reader.onload = (e) => {
            const inputData = reader.result;
            if(checkImg(inputData) == true){
                frontCardImg.src = inputData;
                frontIdCard = inputData;
                frontCardImg.classList.remove('d-none');
                frontCard.classList.add('d-none');
            }else{
                alert('Type file is not supported!!')
            }
        }
    }
})


backCard.addEventListener('change', (e) => {
    const fileTarget = e.target.files[0];
    if(fileTarget){
        const reader = new FileReader();
        reader.readAsDataURL(fileTarget);
        reader.onload = (e) => {
            const inputData = reader.result;
            if(checkImg(inputData) == true){
                backCardImg.src = inputData;
                backIdCard = inputData;
                backCardImg.classList.remove('d-none');
                backCard.classList.add('d-none');
            }else{
                alert('Type file is not supported!!')
            }
        }
    }
})

const checkImg = (data)=>{
    const typeFile = data.split(';')[0].split('/')[1];
    const typeAccept = ['jpe','jpeg','png','jpge'];

    let allow = false;
    typeAccept.forEach((item) => {
        if(item == typeFile){
            allow = true;
        }
    })
    return allow;
}


const saveIDCard = document.querySelector('#saveIDCard');

saveIDCard.addEventListener('click',()=>{
    if(frontIdCard != "" && backIdCard != ""){
        fetch("http://localhost:8080/API/updateIDCard",
            {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({fullname:fullnameUser.innerText,backIdCard,frontIdCard})
            }
        )
        .then(data=>{
            const closeIDCardModal = document.querySelector('.closeIDCardModal');
            frontCardImg.classList.add('d-none');
            backCardImg.classList.add('d-none');
            frontIdCard = '';
            backIdCard = '';
            frontCard.value = '';
            backCard.value = '';
            
            closeIDCardModal.click();

            alert('Success sending your ID card')
        })
    }else{
        frontCardImg.classList.add('d-none');
        backCardImg.classList.add('d-none');
        alert('You must upload two side of your id card!!');
        frontIdCard = '';
        backIdCard = '';
        frontCard.value = '';
        backCard.value = '';
    }
})


const openChangePassFormBtn = document.querySelector('#openChangePassFormBtn');
const changePassForm = document.querySelector('#changePassForm');

openChangePassFormBtn.addEventListener('click',()=>{
    openChangePassFormBtn.classList.add('d-none');
    changePassForm.innerHTML=`
        <div style="display:flex;justify-content: center;flex-direction: column;text-align: center;background: #f2f2fc;padding: 10px;border-radius: 5px;" >
            <h1 style="color:black;text-transform:uppercase;font-weight:bold ">Change Password</h1>
            <input style="padding: 8px;margin-top: 10px; border: 1px solid black;border-radius: 8px" type="text" placeholder="Enter your current password" class="inputChangePass" required>
            <input style="padding: 8px;margin-top: 10px; border: 1px solid black;border-radius: 8px" type="text" placeholder="Enter your new password" class="inputChangePass" required>
            <input style="padding: 8px;margin-top: 10px; border: 1px solid black;border-radius: 8px" type="text" placeholder="Re-Enter your current password" class="inputChangePass" required>
            <div id='errorMsgOfChangePassForm' style="padding: 8px;margin-top: 10px;color:red !important; font-weight:bold; ">
            
            </div>
            <button id="changePassBtn" onclick="changePass()" style="padding: 5px 10px;border-radius: 8px;cursor:pointer;margin-top: 15px;">
                Change Password
            </button>
        </div>
    `;
})

const changePass = ()=>{
    const inputChangePasses = document.querySelectorAll('.inputChangePass');
    let inputsValue = []
    inputChangePasses.forEach((item)=>{
        inputsValue.push(item.value);
    })    
    if(checkFormChangePass(inputsValue) != ''){
        const errorMsgOfChangePassForm = document.querySelector('#errorMsgOfChangePassForm');
        errorMsgOfChangePassForm.innerText = checkFormChangePass(inputsValue);
    }else{
        fetch("http://localhost:8080/userChangePass",
        {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({fullname:fullnameUser.innerText})
        })
        .then((res)=>{
            return res.json();
        })
        .then(data=>{
            return data.oldPass;
        })
        .then((oldPass)=>{
            if(oldPass != inputsValue[0]){
                const errorMsgOfChangePassForm = document.querySelector('#errorMsgOfChangePassForm');
                errorMsgOfChangePassForm.innerText = 'Your current password is incorrect';
            }else{
                fetch("http://localhost:8080/userChangePass",
                    {
                        method: 'PUT', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({fullname:fullnameUser.innerText,newPass:inputsValue[1]})
                    })
                    .then(()=>{
                        alert('Your password has been updated');
                        changePassForm.innerHTML = '';
                        openChangePassFormBtn.classList.remove('d-none');
                    })
                    .catch(e=>{
                        console.log(e);
                        alert('Fail to change password');
                    })
            }
        })
        .catch(e=>console.log(e));
    }
}

const checkFormChangePass = (inputs)=>{
    let msg = '';
    inputs.forEach((item)=>{
        if(item == ''){
            msg = 'Please enter all fields';
            return msg;
        }
    })
    if(inputs[2] != "" && inputs[1] != ''){
        if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/gm.test(inputs[1])){
            msg = 'Your password must be at least 8 characters, at least one letter and one number';
            return msg;
        }
        if(inputs[2] != inputs[1]){
            msg = 'Your password must match!';
            return msg;
        }
    }
    return msg;
}
