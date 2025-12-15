/**
 * Demo - 공개 장부 페이지
 * 거래 타임라인, 요약 정보 시연
 */

// @ts-nocheck
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Wallet,
  Calendar,
  Filter,
} from "lucide-react";
import { useLedgerTimeline, useLedgerSummary } from "@/hooks/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { LedgerTransaction, LedgerSummary } from "@/mocks/data/generators";

// 거래 타입별 아이콘 & 색상
const transactionConfig = {
  deposit: {
    icon: ArrowDownCircle,
    label: "입금",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  withdrawal: {
    icon: ArrowUpCircle,
    label: "출금",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  transfer: {
    icon: TrendingUp,
    label: "이체",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

// 요약 카드 컴포넌트
function SummaryCard({ summary }: { summary: LedgerSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 입금</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +{summary.totalDeposit.toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 출금</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{summary.totalWithdrawal.toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 잔액</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.currentBalance.toLocaleString()}원</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.transactionCount}건</div>
          <p className="text-xs text-muted-foreground mt-1">
            최근 거래: {new Date(summary.lastTransactionDate).toLocaleDateString("ko-KR")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// 거래 항목 컴포넌트
function TransactionItem({ transaction }: { transaction: LedgerTransaction }) {
  const config = transactionConfig[transaction.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className={cn("p-3 rounded-full", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">{transaction.description}</p>
            <Badge variant="outline">{config.label}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={transaction.user.profileImage} />
                <AvatarFallback>{transaction.user.nickname[0]}</AvatarFallback>
              </Avatar>
              <span>{transaction.user.nickname}</span>
            </div>
            <span>•</span>
            <span>{new Date(transaction.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-lg font-bold",
            transaction.type === "deposit" && "text-green-600",
            transaction.type === "withdrawal" && "text-red-600",
            transaction.type === "transfer" && "text-blue-600"
          )}
        >
          {transaction.type === "withdrawal" ? "-" : "+"}
          {transaction.amount.toLocaleString()}원
        </p>
        <p className="text-sm text-muted-foreground">
          잔액: {transaction.balance.toLocaleString()}원
        </p>
      </div>
    </div>
  );
}

// 필터 컴포넌트
function TransactionFilter({
  filters,
  onFilterChange,
}: {
  filters: {
    startDate?: string;
    endDate?: string;
    type?: string;
  };
  onFilterChange: (filters: any) => void;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          필터
        </CardTitle>
        <CardDescription>거래 내역을 필터링하여 조회하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">시작 날짜</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endDate">종료 날짜</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="type">거래 유형</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                onFilterChange({ ...filters, type: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="deposit">입금</SelectItem>
                <SelectItem value="withdrawal">출금</SelectItem>
                <SelectItem value="transfer">이체</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({})}
          >
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 메인 페이지 컴포넌트
export function DemoLedgerPage() {
  const { gyeId = "gye-1" } = useParams();
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    type?: string;
  }>({});

  const { data: summaryData } = useLedgerSummary(gyeId);
  const { data: timelineData } = useLedgerTimeline(gyeId, {
    page: 1,
    limit: 50,
    ...filters,
  });

  const transactions = timelineData?.transactions || [];
  const summary = summaryData;

  // 필터링된 거래 (클라이언트 사이드 필터링 추가)
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    return true;
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">공개 장부</h1>
        <p className="text-muted-foreground">
          계의 모든 거래 내역을 투명하게 확인할 수 있습니다
        </p>
      </div>

      {/* 요약 정보 */}
      {summary && <SummaryCard summary={summary} />}

      {/* 필터 */}
      <TransactionFilter filters={filters} onFilterChange={setFilters} />

      {/* 거래 타임라인 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            거래 내역 ({filteredTransactions.length}건)
          </CardTitle>
          <CardDescription>최신순으로 정렬됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>거래 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                  {index < filteredTransactions.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">입금 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === "deposit").length}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">출금 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === "withdrawal").length}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">이체 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === "transfer").length}건
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
