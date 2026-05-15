export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; code?: string };

export function actionError(error: string, code?: string): ActionResult<never> {
  return { success: false, error, code };
}

export function actionSuccess<T = void>(data?: T): ActionResult<T> {
  return { success: true, data };
}
