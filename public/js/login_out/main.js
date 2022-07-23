const inputs = document.querySelectorAll(".input");


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}



function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

const birthdayInput = document.querySelector('#birthdayInput');
if(birthdayInput){
	birthdayInput.addEventListener('blur',(e)=>{
		if(birthdayInput.value!=""){
			birthdayInput.style = 'color:black !important';
		}else{
			birthdayInput.style = 'color: transparent !important';
		}
	});
	
	birthdayInput.addEventListener('focus',(e)=>{
		birthdayInput.style = 'color:black !important';
	});
}

const frontSide = document.querySelector('#frontSide');
const backSide = document.querySelector('#backSide');
const frontImg = document.querySelector('#frontImg');
const backImg = document.querySelector('#backImg');

const frontSideBe = document.querySelector('.frontSideBe');
const frontSideAf = document.querySelector('.frontSideAf');
const backSideBe = document.querySelector('.backSideBe');
const backSideAf = document.querySelector('.backSideAf');

const frontSideData = document.querySelector('#frontSideData');
const backSideData = document.querySelector('#backSideData');

const IdCardHandle = {
	upload(){
		if(frontSide){
			frontSide.addEventListener('change', (e) => {
				const fileTarget = e.target.files[0];
				const reader = new FileReader();
				reader.readAsDataURL(fileTarget);
				reader.onload = (e) => {
					const inputData = reader.result;
					if(IdCardHandle.checkImg(inputData) == true){
						frontImg.src = inputData;
	
						frontSideData.value = btoa(inputData);
	
						frontSideAf.classList.remove('d-none');
						frontSideBe.classList.add('d-none');
					}else{
						alert('Type file is not supported!!')
					}
				}
			})
			
			backSide.addEventListener('change', (e) => {
				const fileTarget = e.target.files[0];
				const reader = new FileReader();
				reader.readAsDataURL(fileTarget);
				reader.onload = (e) => {
					const inputData = reader.result;
					if(IdCardHandle.checkImg(inputData) == true){
						backImg.src = inputData;
	
						backSideData.value = btoa(inputData);
	
						backSideAf.classList.remove('d-none');
						backSideBe.classList.add('d-none');
					}else{
						alert('Type file is not supported!!')
					}
				}
			})
		}
	},
	checkImg(data){
		const typeFile = data.split(';')[0].split('/')[1];
		const typeAccept = ['jpe','jpeg','png','jpge'];

		let allow = false;
		typeAccept.forEach((item) => {
			if(item == typeFile){
				allow = true;
			}
		})
		return allow;
	},
	imgHandler(){
		if(backImg){
			if(backImg.src != "" && backImg.src != 'http://localhost:8080/register'){
			backSideAf.classList.remove('d-none');
			backSideBe.classList.add('d-none');
			}

			if(frontImg.src != "" && frontImg.src != 'http://localhost:8080/register'){
				frontSideAf.classList.remove('d-none');
				frontSideBe.classList.add('d-none');
			}
		}
	},
	start(){
		this.upload();
		this.imgHandler();
	}
};

IdCardHandle.start();

const errorMsg = document.querySelector('.errorMsg');
if(errorMsg){
	const inputs = document.querySelectorAll('input');
	inputs.forEach((input) => {
		input.focus();
	})
}

inputs.forEach((item)=>{
	if(item.value != ''){
		item.focus();
	}
})







