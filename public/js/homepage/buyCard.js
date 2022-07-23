const mobileCard = document.querySelector('#mobileCard');
const vinaCard = document.querySelector('#vinaCard');
const viettelCard = document.querySelector('#viettelCard');

const buyCardHandle = {
    locationPage(){
        mobileCard.addEventListener('click',(e)=>{
            fetch("http://localhost:8080/buyCard",{
                method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(
                            {
                                type:"Mobifone",
                                username:document.querySelector('#usernameOfThisAccount').value,
                                password:document.querySelector('#passwordOfThisAccount').value
                            })
            })
            .then((res)=>res.json())
            .then(result=>{
                if(result.code == 0){
                    window.location.href = "http://localhost:8080/buyCard";
                }
            })
        })

        vinaCard.addEventListener('click',(e)=>{
            fetch("http://localhost:8080/buyCard",{
                method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(
                            {
                                type:"Vinaphone",
                                username:document.querySelector('#usernameOfThisAccount').value,
                                password:document.querySelector('#passwordOfThisAccount').value
                            })
            })
            .then((res)=>res.json())
            .then(result=>{
                if(result.code == 0){
                    window.location.href = "http://localhost:8080/buyCard";
                }
            })
        })
        
        viettelCard.addEventListener('click',(e)=>{
            fetch("http://localhost:8080/buyCard",{
                method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(
                            {
                                type:"Viettel",
                                username:document.querySelector('#usernameOfThisAccount').value,
                                password:document.querySelector('#passwordOfThisAccount').value
                            })
            })
            .then((res)=>res.json())
            .then(result=>{
                if(result.code == 0){
                    window.location.href = "http://localhost:8080/buyCard";
                }
            })
        })
    },
    start(){
        this.locationPage();
    }
}

buyCardHandle.start();