const Menu=require('../../../app/models/menu')

function homeController(){
    // factory function=> returns object
    return{
        async index(req,res){
            const pizzas=await Menu.find()
            
                // console.log(pizzas)
                res.render('home',{pizzas:pizzas})
            
            
        }
    }
}

module.exports=homeController