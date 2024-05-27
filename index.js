/////////REDIRECT BUTTON FUNTIONALITY
document.getElementById("toIncome").addEventListener("click", function() {
    window.location.href = "https://income.expense-tracker-demo.site/";
});
document.getElementById("toExpense").addEventListener("click", function() {
    window.location.href = "https://expenses.expense-tracker-demo.site/";
});
document.getElementById("toBudget").addEventListener("click", function() {
    window.location.href = "https://budget.expense-tracker-demo.site/";
});
document.getElementById("logout").addEventListener("click", function() {
    cookie_name = "expense_tracker_cookie_container"
    const now = new Date();
    const expirationTime = new Date(now.getTime() - 15 * 60 * 1000);
    document.cookie = `${cookie_name}=; domain=.expense-tracker-demo.site; expires=${expirationTime.toUTCString()}; path=/`;
    window.location.href = 'https://landing.expense-tracker-demo.site/';
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display elements from the server  
    encoded_id = getEncodedID_or_Landing(); 
    income_v_expense();
    income_breakdown();
    expense_breakdown();
    budget_progress();   

});

function income_v_expense() {
    fetch('https://main-py-server.onrender.com/get_income_v_expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({encoded_id:encoded_id}),        
    })
    .then(response => response.json())
    .then(combinedData => {

        if(combinedData.status == 'no_data')
        {
            var div = document.getElementById('income_expense_comparison');
            div.innerHTML = 'NO DATA';
        }
        // Process combined data for Plotly
        //const dates = combinedData.income.map(item => item.month);
        //const incomeValues = combinedData.income.map(item => item.total_income);
        //const expenseValues = combinedData.expenses.map(item => item.total_expenses);
        
        // Extract dates, incomes, and expenses from JSON
        var dates = Object.keys(combinedData.income_expense);
        var incomeValues = dates.map(date => combinedData.income_expense[date].income);
        var expenseValues = dates.map(date => combinedData.income_expense[date].expenses);
 

        // Create Plotly chart
        const trace1 = {
            x: dates,
            y: incomeValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Income',
            line: {color: 'blue'}
        };

        const trace2 = {
            x: dates,
            y: expenseValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Expenses',
            line: {color: 'red'}
        };

        const layout = {
            title: 'Income and Expenses Over Time',
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Amount'
            }
        };

        Plotly.newPlot('income_expense_comparison', [trace1, trace2], layout);
    });
}

function income_breakdown() {
    fetch('https://main-py-server.onrender.com/get_income_breakdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({encoded_id:encoded_id}),       
    })
    .then(response => response.json())    
    .then(data => {   
        if(data.status == 'no_data')
        {
            console.log(data.status)
            var div1 = document.getElementById('income_breakdown');
            div1.innerHTML = 'NO DATA';
        }     
        console.log(data.sorted_combined_incomes)
        incomes = data.sorted_combined_incomes
        const dates = Object.keys(incomes);
        const incomeTypes = Array.from(new Set(dates.flatMap(date => Object.keys(incomes[date]))));

        const traces = incomeTypes.map(incomeType => ({
            x: dates,
            y: dates.map(date => incomes[date][incomeType] || 0),
            mode: 'lines+markers',
            name: incomeType,
            line: {color: getRandomColor()}
        }));

        // Generate a random color
        function getRandomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        // Plot the graph
        Plotly.newPlot('income_breakdown', traces, {
            title: 'Monthly Income Breakdown',
            xaxis: {title: 'Date'},
            yaxis: {title: 'Amount'}
        });                        
    });
}

function expense_breakdown() {
    fetch('https://main-py-server.onrender.com/get_expense_breakdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({encoded_id:encoded_id}),        
    })
    .then(response => response.json())    
    .then(data => {      
        if(data.status == 'no_data')
        {
            console.log(data.status)
            var div = document.getElementById('expense_breakdown');
            div.innerHTML = 'NO DATA';
        } 
        //change names for expenses
        console.log(data.sorted_combined_expenses)
        expenses = data.sorted_combined_expenses
        const dates = Object.keys(expenses);
        const expenseTypes = Array.from(new Set(dates.flatMap(date => Object.keys(expenses[date]))));

        const traces = expenseTypes.map(expenseType => ({
            x: dates,
            y: dates.map(date => expenses[date][expenseType] || 0),
            mode: 'lines+markers',
            name: expenseType,
            line: {color: getRandomColor()}
        }));

        // Generate a random color
        function getRandomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        // Plot the graph
        Plotly.newPlot('expense_breakdown', traces, {
            title: 'Monthly Expense Breakdown',
            xaxis: {title: 'Date'},
            yaxis: {title: 'Amount'}
        });
                        
    });
}

function budget_progress() {
    fetch('https://main-py-server.onrender.com/get_budget_recent_expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({encoded_id:encoded_id}),         
    })
    .then(response => response.json())    
    .then(data => {     
        
        if(data.status == 'no_data')
        {
            var div = document.getElementById('progress_bars');
            div.innerHTML = 'NO DATA';
        } 

        const monthly_expenses = data.monthly_expenses;

        const budgetsArray = Object.entries(data.budget).map(([expenseType, amount]) => ({ budget_expense_type: expenseType, total_budget_amount: amount }));
        
        //const progressBarsContainer = document.getElementById('progressBars');

        const commonExpenseTypes = monthly_expenses.filter(expense =>
            budgetsArray.some(budget => budget.budget_expense_type === expense.expense_type)
          );


        const expenseData = commonExpenseTypes.map(expense => {
            const budget = budgetsArray.find(budget => budget.budget_expense_type === expense.expense_type);
            return {
              type: expense.expense_type,
              progress: (expense.total_amount / budget.total_budget_amount) * 100,
            };
          });
        
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: expenseData.map(expense => expense.type),
              datasets: [{
                label: 'Budget Percentage Used(%)',
                data: expenseData.map(expense => expense.progress),
                backgroundColor: expenseData.map(expense => {
                    // Dynamically set the background color based on the progress percentage
                    if (expense.progress <= 50) {
                      return 'green';
                    } else if (expense.progress <= 75) {
                      return 'orange';
                    } else {
                      return 'red';
                    }
                  }),
              }]
            },
            options: 
            {
                indexAxis: 'y',
                scales: 
                {
                    x: {beginAtZero: true,max: 100,title:{display: true, text: 'Percentage of Budget Spent', padding: {top: 20,bottom: 10}}},
                    y: {title:{display: true, text: 'Expense Type', padding: {top: 20,bottom: 10}}}
                },

                responsive: true,
                maintainAspectRatio: false,
                plugins: 
                {
                    legend: {display: false,},                   
                }
                 
            },
          });

    });
}


function getEncodedID_or_Landing() {
    const cookies = document.cookie.split(';');
    cookie_name = "expense_tracker_cookie_container"
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');

        if (name === cookie_name) {
            return value;
        }
    }
    window.location.href = 'https://landing.expense-tracker-demo.site/';
}