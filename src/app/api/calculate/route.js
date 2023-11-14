import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req, res) {
  try {
    const body = await req.json();
    const result = await prisma.calculate.create({
      data: body,
    });
    return NextResponse.json({ msg: "success", data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, res) {
  try {
    const body = await req.json();
    const findWallet = await prisma.calculate.findUnique({
      where: {
        id: body.id,
      },
    });
    // 1st step check

    if (!findWallet) {
      return NextResponse.json({ msg: "Wallet not found" });
    }

    // 2nd step balance check
    if (findWallet.balance < body.balance) {
      return NextResponse.json({ msg: "Balance not enough" });
    }

    // 3rd step update balance
    const updateStep = prisma.calculate.update({
      where: {
        id: body.id,
      },
      data: {
        balance: findWallet.balance - body.balance,
      },
    });

    const insertExpense = prisma.expense.create({
      data: {
        ...body.expense,
      },
    });

    const result = await prisma.$transaction([updateStep, insertExpense]);

    return NextResponse.json({ msg: "success", data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
