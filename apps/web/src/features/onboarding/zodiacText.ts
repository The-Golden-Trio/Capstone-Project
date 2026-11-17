// Chép nguyên châm ngôn, cá tính và mặt cần để ý từ research/reports/Hoàng đạo 12 cung.md (bản nháp khối F).
export const zodiacText: Record<
  string,
  { motto: string; personality: string; caution: string }
> = {
  bach_duong: {
    motto: 'Tôi là',
    personality:
      'Bạch Dương mở đầu vòng hoàng đạo, nên mang năng lượng của sự khởi đầu: thẳng thắn, can đảm và luôn muốn là người bước lên trước. Bạn thường hành động ngay khi có ý tưởng và tiếp thêm lửa cho người xung quanh. Bạn thích thử thách, càng khó càng muốn làm.',
    caution:
      'sự nóng vội đôi khi khiến bạn bỏ qua chi tiết; dừng lại một nhịp trước khi lao vào sẽ giúp ngọn lửa cháy lâu hơn.',
  },
  kim_nguu: {
    motto: 'Tôi có',
    personality:
      'Kim Ngưu vững vàng như đất mùa xuân: kiên nhẫn, đáng tin và làm việc gì cũng tới nơi tới chốn. Bạn trân trọng những điều bền lâu, yêu cái đẹp và sự dễ chịu trong cuộc sống. Người khác thấy yên tâm khi có bạn bên cạnh.',
    caution:
      'sự kiên định có lúc thành bướng bỉnh; mở lòng với cách làm mới sẽ khiến bạn còn vững hơn.',
  },
  song_tu: {
    motto: 'Tôi nghĩ',
    personality:
      'Song Tử tò mò về mọi thứ: nhanh nhạy, hoạt ngôn và học điều mới rất nhanh. Bạn giỏi kết nối ý tưởng và con người, cuộc trò chuyện nào có bạn cũng sôi nổi hơn. Hai mặt của cặp song sinh cho bạn khả năng nhìn một vấn đề từ nhiều phía.',
    caution:
      'nhiều mối quan tâm cùng lúc dễ khiến bạn dàn trải; chọn một việc làm tới cùng sẽ giúp bạn thấy rõ mình giỏi tới đâu.',
  },
  cu_giai: {
    motto: 'Tôi cảm',
    personality:
      'Cự Giải sống bằng trái tim: chu đáo, giàu tình cảm và luôn che chở cho người mình thương. Bạn có trực giác tốt, thường hiểu người khác cần gì trước cả khi họ nói ra. Gia đình và những người thân thiết là chốn bình yên của bạn.',
    caution:
      'như con cua, bạn hay thu mình vào vỏ khi bị tổn thương; chia sẻ cảm xúc với người tin cậy sẽ nhẹ lòng hơn.',
  },
  su_tu: {
    motto: 'Tôi muốn',
    personality:
      'Sư Tử ấm áp và rạng rỡ như Mặt Trời chủ quản: tự tin, hào phóng và có sức hút tự nhiên. Bạn thích sáng tạo, thích thể hiện và biết cách truyền cảm hứng cho cả nhóm. Bạn trung thành và luôn đứng ra bảo vệ người của mình.',
    caution:
      'bạn cần được ghi nhận; nhớ rằng giá trị của bạn không phụ thuộc vào lời khen của người khác.',
  },
  xu_nu: {
    motto: 'Tôi phân tích',
    personality:
      'Xử Nữ tỉ mỉ và chu toàn: bạn nhìn ra chi tiết mà người khác bỏ sót và thích làm mọi thứ gọn gàng, đúng cách. Bạn sẵn lòng giúp đỡ và thấy vui khi công việc của mình có ích thật sự. Óc phân tích giúp bạn tìm ra cách làm tốt hơn.',
    caution:
      'tiêu chuẩn cao có lúc khiến bạn quá khắt khe với chính mình; "đủ tốt" đôi khi đã là tốt.',
  },
  thien_binh: {
    motto: 'Tôi cân bằng',
    personality:
      'Thiên Bình đi tìm sự hài hoà: hoà nhã, công bằng và giỏi đặt mình vào vị trí người khác. Bạn có gu thẩm mỹ tốt và thích làm việc cùng người khác hơn là một mình. Khi nhóm bất đồng, bạn thường là người tìm ra điểm chung.',
    caution:
      'cân nhắc mọi phía khiến bạn khó quyết định; tin vào lựa chọn của mình cũng là một cách giữ cân bằng.',
  },
  bo_cap: {
    motto: 'Tôi khao khát',
    personality:
      'Bọ Cạp sâu sắc và mãnh liệt: bạn nhìn thấu bề mặt để tìm ra điều thật sự bên dưới. Khi đã quyết tâm, bạn theo đến cùng và rất trung thành với người mình tin. Bọ Cạp gắn với sự lột xác: mỗi khó khăn đi qua làm bạn mạnh hơn.',
    caution:
      'bạn hay giữ kín suy nghĩ; mở lòng một chút sẽ giúp người khác hiểu và đồng hành với bạn.',
  },
  nhan_ma: {
    motto: 'Tôi hiểu',
    personality:
      'Nhân Mã luôn hướng mũi tên về phía chân trời: lạc quan, ham khám phá và thích học hỏi những điều lớn lao. Bạn thẳng thắn, vui vẻ và cần không gian tự do để phát triển. Mỗi chuyến đi, mỗi ý tưởng mới đều làm bạn hào hứng.',
    caution:
      'sự thẳng thắn có lúc làm người khác chạnh lòng; thêm một chút tế nhị, lời nói của bạn sẽ có sức nặng hơn.',
  },
  ma_ket: {
    motto: 'Tôi dùng',
    personality:
      'Ma Kết leo núi từng bước một: kỷ luật, có trách nhiệm và kiên trì với mục tiêu dài hạn. Bạn chín chắn sớm, biết lên kế hoạch và không ngại làm việc chăm chỉ. Thành quả của bạn thường đến muộn nhưng vững chắc.',
    caution:
      'bạn hay gánh nhiều việc và nghiêm khắc với bản thân; cho phép mình nghỉ ngơi cũng là một phần của chặng đường.',
  },
  bao_binh: {
    motto: 'Tôi biết',
    personality:
      'Bảo Bình đi trước thời đại: độc lập, nhiều ý tưởng mới và thích nghĩ khác số đông. Bạn quan tâm tới cộng đồng, coi trọng tình bạn và mong mọi thứ công bằng hơn. Người mang nước rót tri thức cho mọi người, và bạn cũng thích chia sẻ điều mình biết.',
    caution:
      'bạn có thể giữ khoảng cách với cảm xúc; để người khác thấy bạn quan tâm sẽ giúp ý tưởng của bạn lan xa hơn.',
  },
  song_ngu: {
    motto: 'Tôi tin',
    personality:
      'Song Ngư khép lại vòng hoàng đạo, mang trong mình một chút của mọi cung: giàu tưởng tượng, đồng cảm và nhạy với cảm xúc của người khác. Bạn có tâm hồn nghệ sĩ và trực giác mạnh. Hai con cá bơi hai hướng cho bạn khả năng thích nghi với mọi dòng nước.',
    caution:
      'bạn dễ ôm cảm xúc của người khác vào mình; giữ một khoảng riêng sẽ giúp bạn luôn vững vàng.',
  },
};
