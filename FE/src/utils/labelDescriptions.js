export const labelDescriptions = {
  0: {
    description: "Tin về công nghệ, AI, phần mềm, thiết bị, internet.",
    examples: "AI, smartphone, phần mềm, mạng xã hội",
  },
  1: {
    description: "Tin về giáo dục, trường học, thi cử, tuyển sinh, học sinh.",
    examples: "tuyển sinh, thi lớp 10, đại học, học phí",
  },
  2: {
    description: "Tin về giải trí, nghệ sĩ, âm nhạc, phim ảnh, showbiz.",
    examples: "ca sĩ, diễn viên, phim, concert, gameshow",
  },
  3: {
    description: "Tin về khoa học, nghiên cứu, phát hiện, thiên văn, tự nhiên.",
    examples: "nghiên cứu, vũ trụ, sinh học, phát minh",
  },
  4: {
    description: "Tin về pháp luật, điều tra, vụ án, tòa án, xử phạt.",
    examples: "vụ án, bắt giữ, tòa án, công an, truy tố",
  },
  5: {
    description: "Tin về sức khỏe, bệnh, y tế, dinh dưỡng, chăm sóc sức khỏe.",
    examples: "bệnh viện, bác sĩ, vaccine, dinh dưỡng",
  },
  6: {
    description: "Tin quốc tế, chính trị thế giới, xung đột, quan hệ quốc tế.",
    examples: "Mỹ, Trung Quốc, Nga, chiến sự, quốc tế",
  },
  7: {
    description: "Tin thể thao, bóng đá, tennis, giải đấu, vận động viên.",
    examples: "bóng đá, V-League, World Cup, tennis",
  },
  8: {
    description: "Tin về xe cộ, ô tô, xe máy, thị trường xe, giao thông xe.",
    examples: "ô tô, xe máy, biển số, đăng kiểm, xe điện",
  }
};

export function getLabelDescription(labelId) {
  return (
    labelDescriptions[Number(labelId)] || {
      description: "Chưa có mô tả cho nhãn này.",
      examples: "Chưa có ví dụ.",
    }
  );
}