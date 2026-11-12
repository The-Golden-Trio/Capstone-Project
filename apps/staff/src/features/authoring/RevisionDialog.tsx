import { useState } from 'react';
import { Button, Dialog, TextArea } from '../../components/ui';

/** Yêu cầu AI sửa một phần (`requestRevision`, SD-05 vòng sửa). */
export function RevisionDialog({
  label,
  busy,
  onSubmit,
  onClose,
}: {
  label: string;
  busy: boolean;
  onSubmit: (request: string) => void;
  onClose: () => void;
}) {
  const [request, setRequest] = useState('');
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Sửa bằng AI: ${label}`}
      footer={
        <>
          <Button onClick={onClose}>Huỷ</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!request.trim()}
            onClick={() => onSubmit(request)}
          >
            Gửi yêu cầu
          </Button>
        </>
      }
    >
      <p className="mb-2 text-[13px] text-muted">
        AI sửa phần đã lưu gần nhất. Kết quả hiện vào trình soạn để bạn xem; chỉ
        ghi khi bạn bấm Lưu.
      </p>
      <TextArea
        label="Bạn muốn sửa thế nào?"
        rows={4}
        maxLength={2000}
        value={request}
        onChange={(e) => setRequest(e.target.value)}
      />
    </Dialog>
  );
}
