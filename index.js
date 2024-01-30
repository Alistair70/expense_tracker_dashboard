/////////REDIRECT BUTTON FUNTIONALITY
document.getElementById("toIncome").addEventListener("click", function() {
    window.location.href = "https://expense-tracker-income.netlify.app";
});
document.getElementById("toExpense").addEventListener("click", function() {
    window.location.href = "https://expense-tracker-expenses.netlify.app";
});
document.getElementById("toBudget").addEventListener("click", function() {
    window.location.href = "https://expense-tracker-budget.netlify.app";
});

document.getElementById("logout").addEventListener("click", function() {
    cookie_name = "expense_tracker_cookie_container"
    document.cookie = `${cookie_name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    window.location.href = 'https://expense-tracker-aytr.onrender.com';
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
    fetch('https://expense-tracker-aytr.onrender.com/get_income_v_expense', {
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
            console.log(combinedData.status)
            var div = document.getElementById('income_expense_comparison');
            div.innerHTML = 'NO DATA';
        }
        // Process combined data for Plotly
        const dates = combinedData.income.map(item => item.month);
        const incomeValues = combinedData.income.map(item => item.total_income);
        const expenseValues = combinedData.expenses.map(item => item.total_expenses);

        // Create Plotly chart
        const trace1 = {
            x: dates,
            y: incomeValues,
            type: 'scatter',
            mode: 'lines',
            name: 'Income',
            line: {color: 'blue'}
        };

        const trace2 = {
            x: dates,
            y: expenseValues,
            type: 'scatter',
            mode: 'lines',
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
    fetch('https://expense-tracker-aytr.onrender.com/get_income_breakdown', {
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
        // Extract unique income types
        const incomeTypes = [...new Set(data.map(entry => entry.income_type))];

        // Prepare data for Plotly
        const incomes = incomeTypes.map(income_type => {
            const filteredData = data.filter(entry => entry.income_type === income_type);
            const xValues = filteredData.map(entry => entry.month);
            const yValues = filteredData.map(entry => entry.income_type_sum);

            return {
                type: 'scatter',
                mode: 'lines+markers',
                name: income_type,
                x: xValues,
                y: yValues
            };
        });

        // Layout configuration for the plot
        const layout = {
            title: 'Monthly Income Comparison',
            xaxis: {
                title: 'Month'
            },
            yaxis: {
                title: 'Total Income'
            }
        };

        // Create the plot
        Plotly.newPlot('income_breakdown', incomes, layout);
                        
    });
}

function expense_breakdown() {
    fetch('https://expense-tracker-aytr.onrender.com/get_expense_breakdown', {
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
        
        // Extract unique income types
        const expenseTypes = [...new Set(data.map(entry => entry.expense_type))];

        // Prepare data for Plotly
        const expenses = expenseTypes.map(expense_type => {
            const filteredData = data.filter(entry => entry.expense_type === expense_type);
            const xValues = filteredData.map(entry => entry.month);
            const yValues = filteredData.map(entry => entry.expense_type_sum);

            return {
                type: 'scatter',
                mode: 'lines+markers',
                name: expense_type,
                x: xValues,
                y: yValues
            };
        });

        // Layout configuration for the plot
        const layout = {
            title: 'Monthly Expense Comparison',
            xaxis: {
                title: 'Month'
            },
            yaxis: {
                title: 'Total Expense'
            }
        };

        // Create the plot
        Plotly.newPlot('expense_breakdown', expenses, layout);
                        
    });
}

function budget_progress() {
    fetch('https://expense-tracker-aytr.onrender.com/get_budget_recent_expenses', {
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
    window.location.href = 'https://expense-tracker-aytr.onrender.com';
}