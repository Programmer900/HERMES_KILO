export interface TelegramAuthBody {
  initData: string;
}

export interface GameProgressBody {
  score: number;
  level: number;
}

export interface PaymentInvoiceBody {
  amount: number;
  description: string;
}

export interface PaymentSuccessBody {
  telegramPaymentChargeId: string;
  userId: string;
}

export interface SearchHistoryBody {
  query: string;
  resultsCount: number;
}

export interface SearchQuery {
  q: string;
}
