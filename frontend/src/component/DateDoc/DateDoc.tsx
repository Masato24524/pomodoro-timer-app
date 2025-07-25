import React, { useEffect, useState } from "react";
import "./DateDoc.css";
import type { fetchedDataResponse } from "../../types/type";
import { confirmSession } from "../../utils/confirmSession";
import { API_BASE_URL } from "../../config/api";

const DateDoc = ({
  fetchedData,
  saveButtonChild,
  menuClose,
  selectedDate,
  updateNewEntry,
}: {
  fetchedData: fetchedDataResponse | null;
  saveButtonChild: any;
  menuClose: (value: boolean) => void;
  selectedDate: string;
  updateNewEntry: (newId: number, newTitle: string, newContent: string) => void;
}) => {
  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputContent, setInputContent] = useState<string>("");

  // console.log(selectedDate);

  // fetecedDataが存在する場合はそちらを使用する。
  // （初回時含む）fetchedDataが更新された場合のみ、再レンダリング
  useEffect(() => {
    if (fetchedData && fetchedData.data) {
      setInputTitle(fetchedData.data.doc_title || "");
      setInputContent(fetchedData.data.doc_data || "");
    }
  }, [fetchedData]);

  // 保存ボタンを押したときに、エントリーを更新する
  const putEntry = async (
    fetchedData: fetchedDataResponse | null,
    selectedDate: string
  ) => {
    try {
      // JWTトークンからセッション情報を取得
      const session = await confirmSession();

      // 更新したいデータを定義
      const entryData = {
        id: fetchedData?.data.id,
        entry_date: selectedDate,
        doc_title: inputTitle,
        doc_data: inputContent,
      };

      // console.log("entryData", entryData);

      // データを更新する
      const response = await fetch(
        `${API_BASE_URL}/api/entries/${entryData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`, // ヘッダーにアクセストークを付与する
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entryData),
        }
      );

      const resJson = await response.json();
      // console.log("resJson of DataDoc", resJson);

      // 作成した記事のid,Title,ContentにfetchedDataを更新する
      const newEntryId = resJson.data.id;
      // console.log("newEntryId", newEntryId);
      const newEntryTitle = resJson.data.doc_title;
      const newEntryContent = resJson.data.doc_data;
      updateNewEntry(newEntryId, newEntryTitle, newEntryContent);

      // 親画面（カレンダーを更新する）
      saveButtonChild();

      return resJson;
    } catch (error) {}
  };

  // 閉じるボタンを押したときの処理
  const closeMenuChild = () => {
    const newValue = false;

    // 親に値を通知
    menuClose(newValue);
  };

  // 入力欄の変更が保持されるように更新関数を更新する
  const inputed_title = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };
  const inputed_content = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
  };

  return (
    <div className="input-app-container">
      <div className="input-top-container">
        <div>{selectedDate}</div>
        <div className="input-top-button">
          <button onClick={() => putEntry(fetchedData, selectedDate)}>
            Save
          </button>
          <button onClick={closeMenuChild}>Close</button>
        </div>
      </div>
      <div className="textarea-container">
        <input
          className="title"
          value={inputTitle}
          onChange={inputed_title}
          placeholder="タイトル"
        />
        <textarea
          className="input-textarea"
          name=""
          value={inputContent}
          onChange={inputed_content}
          placeholder="メモ"
        />
      </div>
    </div>
  );
};

export default DateDoc;
