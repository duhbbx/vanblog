import Editor from '@/components/Editor';
import EditorProfileModal from '@/components/EditorProfileModal';
import PublishDraftModal from '@/components/PublishDraftModal';
import Tags from '@/components/Tags';
import UpdateModal from '@/components/UpdateModal';
import { SaveTip } from "@/components/SaveTip";
import {
  deleteArticle,
  deleteDraft,
  getAbout,
  getArticleById,
  getDraftById,
  updateAbout,
  updateArticle,
  createArticle,
  getAllCategories,
  getTags,
  updateDraft,
} from '@/services/van-blog/api';
import { getPathname } from '@/services/van-blog/getPathname';
import { parseMarkdownFile, parseObjToMarkdown } from '@/services/van-blog/parseMarkdownFile';
import { useCacheState } from '@/services/van-blog/useCacheState';
import { DownOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Dropdown, Input, Menu, message, Modal, Space, Tag, Upload } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import moment from 'moment';

import { Form } from 'antd';

import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProForm
} from '@ant-design/pro-components';


export default function () {
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState({});
  const [loading, setLoading] = useState(true);
  const type = history.location.query?.type || 'article';


  const [form] = Form.useForm();


  useEffect(() => {
    if (form && form.setFieldsValue) form.setFieldsValue(currObj);
  }, [currObj]);


  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [currObj, value, type]);
  const onKeyDown = (ev) => {
    let save = false;
    if (ev.metaKey == true && ev.key.toLocaleLowerCase() == 's') {
      save = true;
    }
    if (ev.ctrlKey == true && ev.key.toLocaleLowerCase() == 's') {
      save = true;
    }
    if (save) {
      event?.preventDefault();
      ev?.preventDefault();
      handleSave();
    }
    return false;
  };

  const typeMap = {
    article: '文章',
    draft: '草稿',
    about: '关于',
  };
  const fetchData = useCallback(
    async (noMessage) => {
      setLoading(true);

      const type = history.location.query?.type || 'article';
      const id = history.location.query?.id;


      if (type == 'article' && id) {
        const { data } = await getArticleById(id);
        setValue(data?.content || '');
        document.title = `${data?.title || ''} - VanBlog 编辑器`;
        setCurrObj(data);
      } else {
        document.title = '新文章';
        const data = {
          content: '',
          category: '未分类'
        }
        setValue(data?.content || '');
        setCurrObj(data);
      }

      form.setFieldsValue(currObj)

      setLoading(false);
    },
    [history, setLoading, setValue, type],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // 进入默认收起侧边栏
    const el = document.querySelector('.ant-pro-sider-collapsed-button');
    if (el && el.style.paddingLeft != '') {
      el.click();
    }
  }, []);

  const saveFn = async () => {


    console.log("xxxx");

    const data = form.getFieldsValue()

    data.content = value;

    const v = value;
    setLoading(true);
    if (type == 'article') {

      if (history.location.query.id) {
        await updateArticle(currObj?.id, data);
        await fetchData();
      } else {
        const results = await createArticle(data)

        console.log(results)
        // data.id = results.data.id


        const { location } = history;
        const { search } = location;
        if(search === ''){
          history.push({
            pathname: location.pathname,
            search: 'id=' + results.data.id
          });
        }else{
          history.push({
            pathname: location.pathname,
            search: search +  '&id=' + results.data.id
          });
        }

        await fetchData();
      }

      message.success('保存成功！');
    }


    setLoading(false);
  };

  const handleSave = async () => {
    saveFn()
  };

  return (
    <PageContainer
      className="editor-full"
      style={{ overflow: 'hidden' }}
      header={{
        title: (
          <Form layout="inline" form={form}>
            <ProFormText
              width="md"
              required
              id="title"
              name="title"
              label="文章标题"
              placeholder="请输入标题"
              rules={[{ required: true, message: '这是必填项' }]}
            />

            <ProFormSelect
              width="md"
              required
              id="category"
              name="category"
              tooltip="首次使用请先在站点管理-数据管理-分类管理中添加分类"
              label="分类"
              placeholder="请选择分类"
              rules={[{ required: true, message: '这是必填项' }]}
              request={async () => {
                const { data: categories } = await getAllCategories();
                return categories?.map((e) => {
                  return {
                    label: e,
                    value: e,
                  };
                });
              }}
            />
            <ProFormSelect
              mode="tags"
              tokenSeparators={[',']}
              width="md"
              name="tags"
              label="标签"
              placeholder="请选择或输入标签"
              request={async () => {
                const msg = await getTags();
                return msg?.data?.map((item) => ({ label: item, value: item })) || [];
              }}
            />
          </Form>
        ),
        extra: [
          <Button key="extraSaveBtn" type="primary" onClick={handleSave}>
            {<SaveTip />}
          </Button>,


          <Button
            key="backBtn"
            onClick={() => {
              if (history.location.query?.id) {
                window.open(`/post/${getPathname(currObj)}`, '_blank');
              } else {
                alert("还未保存呢");
              }
            }}
          >
            查看
          </Button>
        ],
        breadcrumb: {},
      }}
      footer={null}
    >
      <div style={{ height: '100%' }}>
        <div style={{ height: '0' }}>
          <Upload
            showUploadList={false}
            multiple={false}
            accept={'.md'}
            style={{ display: 'none', height: 0 }}
          >
            <a key="importBtn" type="link" style={{ display: 'none' }} id="importBtn">
              导入内容
            </a>
          </Upload>
        </div>
        <Editor
          loading={loading}
          setLoading={setLoading}
          value={value}
          onChange={(val) => {
            setValue(val);
          }}
        />
      </div>
    </PageContainer>
  );
}
