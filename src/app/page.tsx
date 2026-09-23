"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";
import { ArrowUpRight, Bell, Check, CircleDollarSign, Edit3, Goal, Landmark, Plus, ReceiptText, WalletCards, X } from "lucide-react";
import { Contribution, currency, defaultCategories, Income, planSummary, WeddingCategory } from "@/lib/plan";

type StoredPlan = { categories: WeddingCategory[]; contributions: Contribution[]; incomes: Income[]; reminded: boolean };
const storageKey = "project-wed-plan";
const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const today = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const [categories, setCategories] = useState(defaultCategories);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [reminded, setReminded] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<"contribution" | "income" | "budget" | null>(null);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<WeddingCategory[]>(defaultCategories);
  const summary = planSummary(categories);
  const recentDeposits = [...contributions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const recentIncome = [...incomes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const monthIncome = incomes.filter((income) => income.date.slice(0, 7) === today().slice(0, 7)).reduce((total, income) => total + income.amount, 0);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    startTransition(() => {
      if (saved) {
        const plan = JSON.parse(saved) as StoredPlan;
        setCategories(plan.categories ?? defaultCategories); setContributions(plan.contributions ?? []); setIncomes(plan.incomes ?? []); setReminded(Boolean(plan.reminded));
      }
      setReady(true);
    });
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(storageKey, JSON.stringify({ categories, contributions, incomes, reminded })); }, [categories, contributions, incomes, reminded, ready]);

  function addContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const amount = Number(form.get("amount")); const categoryId = String(form.get("category"));
    if (!amount || !categoryId) return;
    setContributions((items) => [{ id: crypto.randomUUID(), amount, categoryId, date: String(form.get("date")), note: String(form.get("note")) }, ...items]);
    setCategories((items) => items.map((category) => category.id === categoryId ? { ...category, saved: category.saved + amount } : category)); setModal(null); setNotice("Deposit saved. Your plan is moving forward.");
  }

  function addIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const amount = Number(form.get("amount")); if (!amount) return;
    setIncomes((items) => [{ id: crypto.randomUUID(), amount, date: String(form.get("date")), source: String(form.get("source")) }, ...items]); setModal(null); setNotice("Income added for your reference.");
  }

  function saveBudgets(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setCategories(editing.map((category) => ({ ...category, budget: Math.max(category.saved, category.budget) }))); setModal(null); setNotice("Your wedding plan was updated."); }
  const openBudget = () => { setEditing(categories); setModal("budget"); };

  return <main className="app">
    <aside className="sidebar"><a className="wordmark" href="#top">Project <i>Wed</i><span>your wedding fund</span></a><nav aria-label="Main navigation"><a className="nav-active" href="#overview"><Goal />Overview</a><a href="#fund"><WalletCards />Wedding fund</a><a href="#records"><ReceiptText />Records</a></nav><section className="side-target"><span>Wedding day</span><strong>10 Dec 2027</strong><small>{summary.months} monthly deposits left</small></section><p className="privacy"><Check /> Private to this browser</p></aside>
    <div className="content" id="top">
      <header className="topbar"><div><p className="date-label">{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p><h1>Your wedding fund, clearly planned.</h1></div></header>
      {notice && <div className="toast" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss"><X /></button></div>}

      <section className="overview-hero" id="overview" aria-labelledby="overview-heading"><div className="hero-copy"><p className="section-label">Wedding fund</p><h2 id="overview-heading">{currency(summary.remaining)}<span>remaining</span></h2><p><b>Rp60,000,000 goal</b> · <b>Target date: 10 December 2027</b>. A steady <b>{currency(summary.monthly)} each month</b> keeps the plan on track.</p><div className="hero-actions"><button className="primary" type="button" onClick={() => setModal("contribution")}><Plus />Add a deposit</button><button className="text-button" type="button" onClick={openBudget}>Adjust plan <ArrowUpRight /></button></div></div><div className="date-orbit" aria-label={`${Math.round(summary.progress)} percent of target saved`}><svg viewBox="0 0 180 180" aria-hidden="true"><circle className="orbit-track" cx="90" cy="90" r="75" /><circle className="orbit-progress" cx="90" cy="90" r="75" pathLength="100" style={{ strokeDasharray: `${summary.progress} 100` }} /></svg><div><b>{Math.round(summary.progress)}%</b><span>funded</span></div><small>10<br />DEC<br />2027</small></div></section>

      <section className="ledger" aria-labelledby="ledger-title"><div className="ledger-title"><p className="section-label">The ledger</p><h2 id="ledger-title">Your goal, at a glance.</h2></div><div className="ledger-item"><span>Planned</span><strong>{currency(summary.goal)}</strong></div><div className="ledger-item"><span>Saved</span><strong>{currency(summary.saved)}</strong></div><div className="ledger-item ledger-total"><span>Still to go</span><strong>{currency(summary.remaining)}</strong></div></section>
      <section className="numbers" aria-label="Plan at a glance"><article><div className="stat-icon mineral"><Landmark /></div><p>Saved so far</p><strong>{currency(summary.saved)}</strong><small>{currency(summary.goal)} planned</small></article><article><div className="stat-icon eucalyptus"><CircleDollarSign /></div><p>Income this month</p><strong>{currency(monthIncome)}</strong><small>For your own reference</small></article><article><div className="stat-icon marigold"><Goal /></div><p>Monthly target</p><strong>{currency(summary.monthly)}</strong><small>Until December 2027</small></article></section>

      <section className="split" id="fund"><div className="panel categories"><div className="panel-head"><div><p className="section-label">Your plan</p><h2>Budget categories</h2></div><button className="icon-button" onClick={openBudget} aria-label="Edit wedding budget"><Edit3 /></button></div><div className="category-list">{categories.map((category) => { const progress = category.budget ? Math.min(100, category.saved / category.budget * 100) : 0; return <article className="category" key={category.id}><div className="category-top"><span className="color-dot" style={{ background: category.color }} /><b>{category.name}</b><strong>{currency(category.saved)}</strong></div><div className="bar"><i style={{ width: `${progress}%`, background: category.color }} /></div><p>{currency(category.saved)} saved / {currency(category.budget)} planned · {currency(Math.max(0, category.budget - category.saved))} remaining</p></article>; })}</div></div>
        <div className="right-stack"><section className="panel reminder"><div className="reminder-icon"><Bell /></div><p className="section-label">Monthly checklist</p><h2>Make your next deposit</h2><p>Set aside {currency(summary.monthly)} before the end of this month.</p><label className="check-row"><input type="checkbox" checked={reminded} onChange={(event) => setReminded(event.target.checked)} /><span>{reminded ? "Checked for this browser" : "Mark as checked"}</span></label><small className="browser-note">This is a browser-only checklist. It does not send notifications.</small></section></div>
      </section>

      <section className="records" id="records"><section className="panel record-panel"><div className="panel-head"><div><p className="section-label">Deposits</p><h2>Money moved to the fund.</h2></div><button className="primary small-primary" type="button" onClick={() => setModal("contribution")}><Plus />Add deposit</button></div>{recentDeposits.length ? <div className="activity-list">{recentDeposits.map((item) => <div className="activity-row" key={item.id}><span className="deposit-mark">+</span><div><b>{categories.find((category) => category.id === item.categoryId)?.name ?? "Wedding fund"}</b><small>{formatDate(item.date)}{item.note ? ` · ${item.note}` : ""}</small></div><strong>{currency(item.amount)}</strong></div>)}</div> : <div className="empty"><WalletCards /><p>No deposits yet. Add your first wedding-fund deposit.</p></div>}</section><section className="panel record-panel"><div className="panel-head"><div><p className="section-label">Income</p><h2>Income, kept separate.</h2></div><button className="text-button compact" type="button" onClick={() => setModal("income")}>Log income <ArrowUpRight /></button></div>{recentIncome.length ? <div className="activity-list">{recentIncome.map((item) => <div className="activity-row" key={item.id}><span className="income-mark">↗</span><div><b>{item.source}</b><small>{formatDate(item.date)}</small></div><strong>{currency(item.amount)}</strong></div>)}</div> : <div className="empty"><CircleDollarSign /><p>No income logged yet.</p></div>}</section></section>
    </div>
    <nav className="mobile-nav"><a href="#overview"><Goal />Overview</a><button type="button" onClick={() => setModal("contribution")}><Plus />Deposit</button><a href="#records"><ReceiptText />Records</a></nav>
    {modal === "contribution" && <Modal title="Add a deposit" close={() => setModal(null)}><form onSubmit={addContribution}><label>Amount<input required min="1" name="amount" type="number" inputMode="numeric" placeholder="e.g. 1000000" /></label><label>For which part of the plan?<select name="category" required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Date<input required name="date" type="date" defaultValue={today()} /></label><label>Note <span>(optional)</span><input name="note" placeholder="Salary allocation" /></label><button className="primary full" type="submit">Save deposit <ArrowUpRight /></button></form></Modal>}
    {modal === "income" && <Modal title="Log income" close={() => setModal(null)}><form onSubmit={addIncome}><label>Amount<input required min="1" name="amount" type="number" inputMode="numeric" placeholder="e.g. 5000000" /></label><label>Source<input required name="source" placeholder="Monthly salary" /></label><label>Date<input required name="date" type="date" defaultValue={today()} /></label><button className="primary full" type="submit">Save income <ArrowUpRight /></button></form></Modal>}
    {modal === "budget" && <Modal title="Adjust wedding plan" close={() => setModal(null)} wide><form onSubmit={saveBudgets}><p className="modal-copy">Update estimates anytime. A saved amount cannot exceed the planned budget.</p><div className="budget-editor">{editing.map((category, index) => <label key={category.id}>{category.name}<input type="number" min={category.saved} value={category.budget} onChange={(event) => setEditing((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, budget: Number(event.target.value) } : item))} /></label>)}</div><button className="primary full" type="submit">Save plan <ArrowUpRight /></button></form></Modal>}
  </main>;
}

function Modal({ title, close, children, wide = false }: { title: string; close: () => void; children: React.ReactNode; wide?: boolean }) { return <div className="modal-backdrop" role="presentation" onMouseDown={close}><section className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button type="button" onClick={close} aria-label="Close"><X /></button></div>{children}</section></div>; }
