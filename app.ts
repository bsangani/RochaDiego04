interface IObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

interface IObserver<T> {
  next: (value: T) => void;
  error: (error: Error) => void;
  complete: () => void;
  unsubscribe: () => void;
}

class Observer<T> implements IObserver<T> {
  private handlers: IObserverHandlers<T>;
  private isUnsubscribed: boolean;
  private _unsubscribe?: () => void;

  constructor(handlers: IObserverHandlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }
      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }
      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  setUnsubscribe(unsubscribeFn?: () => void) {
    this._unsubscribe = unsubscribeFn;
  }
}

interface IObservable<T> {
  _subscribe: (observer: Observer<T>) => (() => void) | void;
}

class Observable<T> implements IObservable<T> {
  public _subscribe: (observer: Observer<T>) => (() => void) | void;

  private constructor(
    subscribe: (observer: Observer<T>) => (() => void) | void
  ) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();
      return () => console.log("unsubscribed");
    });
  }

  subscribe(obs: Partial<IObserver<T>>) {
    const observer = new Observer(obs);
    const unsubscribeFn = this._subscribe(observer);
    observer.setUnsubscribe(
      typeof unsubscribeFn === "function" ? unsubscribeFn : undefined
    );

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD: "POST" = "POST";
const HTTP_GET_METHOD: "GET" = "GET";

const HTTP_STATUS_OK: 200 = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: 500 = 500;

type UserMockType = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
};

const userMock: UserMockType = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

type RequestMockType = {
  method: typeof HTTP_POST_METHOD | typeof HTTP_GET_METHOD;
  host: string;
  path: string;
  body?: UserMockType;
  params: Record<string, string>;
};

const requestsMock: RequestMockType[] = [
  {
    method: HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

type HandleRequestType = (request: RequestMockType) => {
  status: typeof HTTP_STATUS_OK | typeof HTTP_STATUS_INTERNAL_SERVER_ERROR;
};

const handleRequest: HandleRequestType = (request) => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: Error) => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
