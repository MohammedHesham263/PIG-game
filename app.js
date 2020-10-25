var BudgetController = (function(){                          // BUDGET CONTROLLER
    
    var Incomes = function(id , description , value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var Expenses = function(id , description , value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expenses.prototype.calcPercentage = function(totalincome){
        if(totalincome > 0)
        {
        this.percentage = Math.round((this.value / totalincome)*100);
        }
        else
        {  
        this.percentage = -1;
        }
    };


    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    }



    var calculateTotals = function(type){
        var sum ;
        sum = 0;
        data.AllItems[type].forEach(function(curr){
            sum += curr.value;
        })
        data.Totals[type] = sum;
    }

    var data = {
        AllItems : {
            inc : [],
            exp : []
        },
        Totals : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        expPercentage : -1
    }
    return {
        addItem : function( type , desc , value){
            var newItem , ID;

            if (data.AllItems[type].length > 0) {
                ID = data.AllItems[type][data.AllItems[type].length -1].id + 1;      //[0,2,3,5,8]                               //getting last element in allitems array + 1 for ID
            }else{
                ID = 0; 
            }

            
            if (type == 'inc') {
                newItem = new Incomes(ID , desc , value)
            }
            else if (type == 'exp') {
                newItem = new Expenses(ID , desc , value)
            }
            data.AllItems[type].push(newItem)
            return newItem

        },
        deleteItem : function(type , id)
        {
            var ids , index;
            ids =  data.AllItems[type].map(function(current){
                return current.id
            })
            index = ids.indexOf(id)
            if (index !== -1) {
                data.AllItems[type].splice(index , 1)
            }
        },
        calculateBudget : function(){
            // calculate total income and total expenses
                calculateTotals('inc');
                calculateTotals('exp');
            // calculate budget : income - expenses
                data.budget = data.Totals.inc - data.Totals.exp
            // calculate percentage of expenses
                if (data.Totals.inc > 0 ) {
                    data.expPercentage = Math.round((data.Totals.exp / data.Totals.inc) * 100);
                }else{
                    data.expPercentage = -1;
                }
        },
        calculatePercentages : function(){
            
            data.AllItems.exp.forEach(function(curr){
                 curr.calcPercentage(data.Totals.inc);
            })
        },
        getPercentages : function(){
           var allPercentages = data.AllItems.exp.map(function(curr){
                curr.getPercentage();
            })
            
            return allPercentages;

        },
        getBudget : function(){
            return{
                budget : data.budget,
                percentage : data.expPercentage,
                totalIncome : data.Totals.inc,
                totalExpenses : data.Totals.exp
            }
        },
        testing : function(){
            return data
        }
    }

})();

var UIcontroller = (function(){                             // UI CONTROLLER !!!
    
    var DOMString = {
        inputType : '.add__type',
        inputDesciption : '.add__description',
        inputValue : '.add__value',
        addButton : '.add__btn',
        incomecontainer : '.income__list',
        expensescontainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        percentagesLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    }
    var formatNumber = function(num , type){
        var numsplit , int , decimal;
        /*
        + or - before the number
        exactly 2 decimal points
        comma separating the thousands
        2310.3542 ---> + 2,310.35
        2310 ---> 2310.00
         */
        num = Math.abs(num);
        num = num.toFixed(2);
        numsplit = num.split('.');
        int = numsplit[0];
        if(int.length > 3){
            int = int.substr( 0 , int.length - 3) + ',' + int.substr(int.length - 3 , 3) 
        }

        decimal = numsplit[1];

        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal ;

    }
    var NodeListForEach=  function(list , callback){
        for(var i = 0 ; i < list.length ; i++){
            callback(list[i],i)
        }
    } 


    return{
        getInput : function(){
            return{
                type : document.querySelector(DOMString.inputType).value,
                description : document.querySelector(DOMString.inputDesciption).value,
                value : parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },

        addItemList : function(obj , type){
            var html, newhtml , element;
            // create the HTML strings with placeholder data
            if (type == 'inc') {
                element = DOMString.incomecontainer
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type == 'exp') {
                element = DOMString.expensescontainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder data with actual data
            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value,type));
            // insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);


        },
        deleteItemSelector : function(selectorID){
            var el ;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        fieldsClearing : function(){
            fields =  document.querySelectorAll(DOMString.inputDesciption +', '+DOMString.inputValue);
            arrFields = Array.prototype.slice.call(fields);
            arrFields.forEach(function(current , Index , array){
                current.value = "";
            });
            arrFields[0].focus();
        },
        displayBudget : function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMString.budgetLabel).textContent= formatNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent= formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMString.expensesLabel).textContent= formatNumber( obj.totalExpenses , 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMString.percentageLabel).textContent= obj.percentage + '%';
            }else{
                document.querySelector(DOMString.percentageLabel).textContent= "---"
            }
        },
        displayPercentages : function(percentages){

            var fields = document.querySelectorAll(DOMString.percentagesLabel);

            
            NodeListForEach (fields , function(current , index){
                if(percentages > 0 ){
                current.textContent = percentages[index] + '%';
                }
                else
                {
                current.textContent = '---';
                }
            })
        },
        typeChange : function(){
            var fields;
            fields = document.querySelectorAll(
                DOMString.inputType +','+
                DOMString.inputDesciption +','+
                DOMString.inputValue);

        NodeListForEach(fields , function(curr){
            curr.classList.toggle('red-focus');
        })
        document.querySelector(DOMString.addButton).classList.toggle('red');
        },

        displayDate : function(){
            var now , month , monthes , year ;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            monthes = ['January' , 'Februray' , 'March' , 'April', 'May' , 'June' , 'July' , 'Augest' , 'September' , 'October' , 'November', 'December'];
            
            document.querySelector(DOMString.dateLabel).textContent = monthes[month] + ' ' + year;

        },
        fieldsclearing2 : function(){
            var field1 , field2

            field1 = document.querySelector(DOMString.inputDesciption).value = "";
            
            field2 = document.querySelector(DOMString.inputValue).value = "";
            
            document.querySelector(DOMString.inputDesciption).focus();

        },
        
        Strings : function(){
            return DOMString
        }
    }
})();

var Controller = (function(budgetctrl,uictrl){              // MAIN CONTROLLER !!!//

    var setupEventListeners = function(){
        var DOM = UIcontroller.Strings();
        document.addEventListener('keypress',function(event){
            if (event.keyCode == 13 || event.which == 13){
                ctrlfunc();
            }
        });
        document.querySelector(DOM.addButton).addEventListener('click',ctrlfunc);
        document.querySelector(DOM.container).addEventListener('click',ctrlDelItem)
        document.querySelector(DOM.inputType).addEventListener('change',uictrl.typeChange)
    };
    var updateBudget = function(){
        // Calculate the budget
            budgetctrl.calculateBudget();
        // return the budget
            var budget = budgetctrl.getBudget();
        // And then Display the budget on the UI
            uictrl.displayBudget(budget);
    }



    var updatepercentages = function(){
        //calculate the percentages
        budgetctrl.calculatePercentages();
        //Read the percentages from the budget controller
        var percentages =  budgetctrl.getPercentages();
        //Update the UI with the new percentages
        uictrl.displayPercentages(percentages);



    }
    var ctrlfunc = function(){
        var inputs , budgetitem;

        // get the input field value 
        inputs = uictrl.getInput();
        if (inputs.description !== "" && !isNaN(inputs.value)  && inputs.value > 0) {
        // add the item to the budget controller
        budgetitem = budgetctrl.addItem(inputs.type , inputs.description , inputs.value)
        // add the Item to the UI
        uictrl.addItemList(budgetitem,inputs.type)
        //clearing out the fields
        uictrl.fieldsClearing();
        //calculate and update the budget
        updateBudget();
        //calculate and update the percentages
        updatepercentages();

        }
    };
    var ctrlDelItem = function(event){
        var itemID , splitID , type , id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }
        // delete the item from the data structure
        budgetctrl.deleteItem(type , id);
        // delete the item from the UI 
        uictrl.deleteItemSelector(itemID);
        // update the show the new budget
        updateBudget();
        //calculate and update the percentages
        updatepercentages();

    }
    


        return{
            init : function(){
                console.log('Application started')
                uictrl.displayDate();
                uictrl.displayBudget({
                    budget : 0,
                    percentage : -1,
                    totalIncome : 0,
                    totalExpenses : 0
                });
            setupEventListeners();
            }
        }
     // -------------------
})(BudgetController,UIcontroller);

Controller.init();



