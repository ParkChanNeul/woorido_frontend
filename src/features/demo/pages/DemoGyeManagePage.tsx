/**
 * Demo - 계 관리 페이지
 * 계 생성, 가입, 탈퇴, 멤버 관리 기능 시연
 */

// @ts-nocheck
import { useState } from "react";
import { Plus, Users, DollarSign, Calendar, Crown, UserMinus } from "lucide-react";
import {
  useGyeList,
  useGyeDetail,
  useGyeMembers,
  useCreateGye,
  useJoinGye,
  useLeaveGye,
} from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Gye, GyeMember, CreateGyeRequest } from "@/types";

// 계 상태 뱃지
function GyeStatusBadge({ status }: { status: Gye["status"] }) {
  const variants = {
    recruiting: { label: "모집 중", variant: "default" as const },
    ongoing: { label: "진행 중", variant: "secondary" as const },
    completed: { label: "완료", variant: "outline" as const },
  };

  const { label, variant } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}

// 계 카드 컴포넌트
function GyeCard({ gye, onSelect }: { gye: Gye; onSelect: (id: string) => void }) {
  const joinGye = useJoinGye();

  const handleJoin = () => {
    joinGye.mutate({
      gyeId: gye.id,
      message: "가입 신청합니다!",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => onSelect(gye.id)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{gye.name}</CardTitle>
            <CardDescription className="line-clamp-2">{gye.description}</CardDescription>
          </div>
          <GyeStatusBadge status={gye.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">참여 인원</span>
            <span className="font-semibold">
              {gye.currentMembers} / {gye.maxMembers}명
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">월 납입액</span>
            <span className="font-semibold">{gye.monthlyAmount.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">보증금</span>
            <span className="font-semibold">{gye.depositAmount.toLocaleString()}원</span>
          </div>

          <Separator />

          {gye.status === "recruiting" && gye.currentMembers < gye.maxMembers && (
            <Button className="w-full" onClick={handleJoin} disabled={joinGye.isPending}>
              {joinGye.isPending ? "가입 중..." : "계 가입하기"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 계 생성 다이얼로그
function CreateGyeDialog() {
  const [open, setOpen] = useState(false);
  const createGye = useCreateGye();
  const [formData, setFormData] = useState<CreateGyeRequest>({
    name: "",
    description: "",
    category: "savings",
    maxMembers: 10,
    monthlyAmount: 100000,
    depositAmount: 50000,
    cycleMonths: 12,
    isPublic: true,
  });

  const handleSubmit = () => {
    createGye.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          category: "savings",
          maxMembers: 10,
          monthlyAmount: 100000,
          depositAmount: 50000,
          cycleMonths: 12,
          isPublic: true,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          새 계 만들기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새로운 계 만들기</DialogTitle>
          <DialogDescription>계의 정보를 입력하고 멤버를 모집하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">계 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 주말 등산 모임 계"
            />
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="계에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">저축</SelectItem>
                  <SelectItem value="investment">투자</SelectItem>
                  <SelectItem value="social">친목</SelectItem>
                  <SelectItem value="emergency">비상금</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxMembers">최대 인원</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) =>
                  setFormData({ ...formData, maxMembers: parseInt(e.target.value) })
                }
                min={2}
                max={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyAmount">월 납입액 (원)</Label>
              <Input
                id="monthlyAmount"
                type="number"
                value={formData.monthlyAmount}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyAmount: parseInt(e.target.value) })
                }
                step={10000}
              />
            </div>

            <div>
              <Label htmlFor="depositAmount">보증금 (원)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={(e) =>
                  setFormData({ ...formData, depositAmount: parseInt(e.target.value) })
                }
                step={10000}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cycleMonths">진행 기간 (개월)</Label>
            <Input
              id="cycleMonths"
              type="number"
              value={formData.cycleMonths}
              onChange={(e) =>
                setFormData({ ...formData, cycleMonths: parseInt(e.target.value) })
              }
              min={1}
              max={60}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || createGye.isPending}>
            {createGye.isPending ? "생성 중..." : "계 만들기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 멤버 카드 컴포넌트
function MemberCard({ member }: { member: GyeMember }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.user.profileImage} />
          <AvatarFallback>{member.user.nickname[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{member.user.nickname}</p>
            {member.role === "host" && (
              <Badge variant="default" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                호스트
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            납입 {member.paidCount}회 · 총 {member.totalPaid.toLocaleString()}원
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={member.depositPaid ? "default" : "destructive"}>
          {member.depositPaid ? "보증금 완료" : "보증금 미납"}
        </Badge>
        <Badge variant={member.status === "active" ? "secondary" : "outline"}>
          {member.status === "active" ? "활동 중" : "탈퇴"}
        </Badge>
      </div>
    </div>
  );
}

// 계 상세 뷰
function GyeDetailView({ gyeId, onBack }: { gyeId: string; onBack: () => void }) {
  const { data: gyeDetail } = useGyeDetail(gyeId);
  const { data: membersData } = useGyeMembers(gyeId);
  const leaveGye = useLeaveGye();

  const handleLeave = () => {
    if (
      confirm(
        "정말로 탈퇴하시겠습니까? 계가 진행 중인 경우 보증금이 몰수될 수 있습니다."
      )
    ) {
      leaveGye.mutate(
        {
          gyeId,
          reason: "개인 사정",
        },
        {
          onSuccess: () => {
            onBack();
          },
        }
      );
    }
  };

  if (!gyeDetail) {
    return <div>로딩 중...</div>;
  }

  const members = membersData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← 목록으로
        </Button>
        <h2 className="text-2xl font-bold">{gyeDetail.name}</h2>
        <GyeStatusBadge status={gyeDetail.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{gyeDetail.description}</p>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">참여 인원</span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">
                  {gyeDetail.currentMembers} / {gyeDetail.maxMembers}명
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">월 납입액</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{gyeDetail.monthlyAmount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">보증금</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{gyeDetail.depositAmount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">진행 기간</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">{gyeDetail.cycleMonths}개월</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleLeave} disabled={leaveGye.isPending}>
              <UserMinus className="h-4 w-4 mr-2" />
              {leaveGye.isPending ? "탈퇴 중..." : "계 탈퇴"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>멤버 목록 ({members.length}명)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// 메인 페이지 컴포넌트
export function DemoGyeManagePage() {
  const { data: gyes } = useGyeList();
  const [selectedGyeId, setSelectedGyeId] = useState<string | null>(null);

  if (selectedGyeId) {
    return <GyeDetailView gyeId={selectedGyeId} onBack={() => setSelectedGyeId(null)} />;
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">계 관리</h1>
          <p className="text-muted-foreground">계를 만들고 멤버들과 함께 목표를 달성하세요</p>
        </div>
        <CreateGyeDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyes?.map((gye) => (
          <GyeCard key={gye.id} gye={gye} onSelect={setSelectedGyeId} />
        ))}
      </div>

      {gyes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">아직 계가 없습니다</p>
          <CreateGyeDialog />
        </div>
      )}
    </div>
  );
}
