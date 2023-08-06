const dotenv = require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { find } = require("lodash");

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extends:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://lista:'+process.env.PASSWORD_DB+'@cluster0.ybnfdtv.mongodb.net/todoListDB');

const itemShema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemShema]
};

const Item = mongoose.model("Items",itemShema);
const List = mongoose.model("List",listSchema);

const Obj1 = new Item({name: "Lavar roupa"});
const Obj2 = new Item({name: "Limpar carro"});
const Obj3 = new Item({name: "Fazer compras"});

const defaultItems = [Obj1,Obj2,Obj3];

app.get("/",function(req,res){

    // find all documents
    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Success inserted itens!")
                }
            });
            res.redirect("/");
        }else{
            res.render('list',{listTitle:"Today",newListItem:foundItems});
        }
    });
});
    

app.post("/", function(req,res){

    const itemName = req.body.campo;
    const rota = req.body.button;

    const item = new Item({name: itemName});

    if(rota === "Today"){
        item.save();
        res.redirect("/");
    }else{ 
        List.findOne({name: rota},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+rota);
        });        
    }      
});

app.get("/:param",function(req,res){
    const result = _.capitalize(req.params.param);

    List.findOne({name:result},function(err,foundList){
    
        if(err) throw err;
            if(!foundList){
                // Create a new list
                console.log("Dont's exists!");
                const Obj = new List({
                    name:result,
                    items:defaultItems
                });
                Obj.save();
                res.redirect('/'+result);
            }else{
                // Show an existing list
                console.log("Exists!");
                res.render('list',{listTitle:foundList.name,newListItem:foundList.items});
            }
    });
});

app.post("/delete",function(req,res){
    console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(req.body.checkbox,function(err){
            if(err) throw err;
            console.log('Delete item with success!');
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(err) throw err;
            res.redirect("/"+listName);
        });
    }
});

let port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}

app.listen(port,function(){
    console.log("Server started successfully!");
});



