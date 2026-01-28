export const budgetEmailTemplate = (name, alertType, spent, budget, percent, tips) => {
    const isExceeded = alertType === "EXCEEDED";
    const statusColor = isExceeded ? "#ef4444" : "#f59e0b"; // red-500 or amber-500
    const statusTitle = isExceeded ? "Budget Exceeded" : "Budget Warning";
    const statusEmoji = isExceeded ? "🚨" : "⚠️";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
            .content { padding: 30px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 99px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
            .greeting { font-size: 20px; margin-bottom: 10px; color: #f8fafc; }
            .message { color: #94a3b8; line-height: 1.6; margin-bottom: 30px; }
            .stats-card { background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #334155; }
            .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; }
            .stat-row:last-child { border-bottom: none; }
            .stat-label { color: #64748b; font-size: 14px; }
            .stat-value { color: #f8fafc; font-weight: 600; }
            .stat-value.highlight { color: ${statusColor}; font-size: 18px; }
            .ai-section { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #10b981; }
            .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #10b981; font-weight: 700; }
            .ai-tips { color: #cbd5e1; font-size: 15px; line-height: 1.8; white-space: pre-wrap; }
            .footer { padding: 20px; text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #334155; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Wealth Assistant</h1>
            </div>
            <div class="content">
                <div class="status-badge">${statusEmoji} ${statusTitle}</div>
                <div class="greeting">Hi ${name},</div>
                <div class="message">
                    You've reached a significant spending milestone this month. Here's a quick update on your budget status.
                </div>
                
                <div class="stats-card">
                    <div class="stat-row">
                        <span class="stat-label">Monthly Budget</span>
                        <span class="stat-value">₹${Number(budget).toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Total Spent</span>
                        <span class="stat-value">₹${Number(spent).toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Usage Level</span>
                        <span class="stat-value highlight">${percent}%</span>
                    </div>
                </div>

                <div class="ai-section">
                    <div class="ai-header">
                        <span>🤖 Smart Financial Tips</span>
                    </div>
                    <div class="ai-tips">${tips}</div>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Wealth App • Automated Financial Intelligence<br>
                Powered by Advanced Agentic AI
            </div>
        </div>
    </body>
    </html>
    `;
};

export const monthlyReportTemplate = (name, month, year, income, expense, savings, aiTips) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
            .header { padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
            .content { padding: 30px; }
            .report-title { font-size: 22px; font-weight: 700; color: #f8fafc; margin-bottom: 5px; text-align: center; }
            .report-date { font-size: 14px; color: #64748b; margin-bottom: 30px; text-align: center; }
            .financial-grid { display: grid; gap: 15px; margin-bottom: 30px; }
            .card { background: #0f172a; border-radius: 12px; padding: 15px; border: 1px solid #334155; text-align: center; }
            .card-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .card-value { font-size: 20px; font-weight: 700; }
            .income { color: #10b981; }
            .expense { color: #f43f5e; }
            .savings { color: #0ea5e9; }
            .ai-section { background: #0f172a; border-radius: 12px; padding: 20px; border-left: 4px solid #10b981; }
            .ai-header { color: #10b981; font-weight: 700; margin-bottom: 10px; }
            .ai-tips { color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
            .footer { padding: 20px; text-align: center; color: #475569; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h1>Wealth Monthly</h1></div>
            <div class="content">
                <div class="report-title">Financial Review</div>
                <div class="report-date">${month} ${year}</div>
                
                <table style="width:100%; border-spacing: 10px; margin-left: -10px;">
                    <tr>
                        <td style="width:50%;">
                            <div class="card">
                                <div class="card-label">Total Income</div>
                                <div class="card-value income">₹${Number(income).toLocaleString()}</div>
                            </div>
                        </td>
                        <td style="width:50%;">
                            <div class="card">
                                <div class="card-label">Total Expense</div>
                                <div class="card-value expense">₹${Number(expense).toLocaleString()}</div>
                            </div>
                        </td>
                    </tr>
                </table>
                <div class="card" style="margin-bottom: 30px;">
                    <div class="card-label">Net Savings</div>
                    <div class="card-value savings">₹${Number(savings).toLocaleString()}</div>
                </div>

                <div class="ai-section">
                    <div class="ai-header">🧠 AI Financial Insights</div>
                    <div class="ai-tips">${aiTips}</div>
                </div>
            </div>
            <div class="footer">&copy; 2026 Wealth App • Smart Finance for Smart People</div>
        </div>
    </body>
    </html>
    `;
};
