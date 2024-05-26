import Editor from '@/components/Editor';
import {createArticle, getArticleById, updateArticle,} from '@/services/van-blog/api';
import {getPathname} from '@/services/van-blog/getPathname';
import {message, Upload} from 'antd';
import {useCallback, useEffect, useRef, useState} from 'react';
import {history} from 'umi';


export default function () {
  const [modifyButNotSave, setModifyButNotSave] = useState(false);
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState({});
  const [loading, setLoading] = useState(true);
  const type = history.location.query?.type || 'article';

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (modifyButNotSave) {
        const confirmationMessage = '你确定要离开此页面吗？未保存的数据可能会丢失。';
        event.returnValue = confirmationMessage; // 现代浏览器需要这个赋值
        return confirmationMessage; // 某些浏览器可能仍然需要这个返回值
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modifyButNotSave]);


  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [currObj, value, type]);
  const onKeyDown = (ev) => {
    let save = false;
    const SAVE = 1;
    const VIEW = 2;
    let op = 0;
    if (ev.metaKey === true && ev.key.toLocaleLowerCase() === 's') {
      op = SAVE;
    }
    if (ev.ctrlKey === true && ev.key.toLocaleLowerCase() === 's') {
      op = SAVE;
    }

    if (ev.metaKey === true && ev.key.toLocaleLowerCase() === 'd') {
      op = VIEW;
    }
    if (ev.ctrlKey === true && ev.key.toLocaleLowerCase() === 'd') {
      op = VIEW;
    }


    if (op === SAVE) {
      event?.preventDefault();
      ev?.preventDefault();
      handleSave();
    } else if (op === VIEW) {
      event?.preventDefault();
      ev?.preventDefault();
      viewArticle();
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


      if (type === 'article' && id) {
        const {data} = await getArticleById(id);
        // setValue(data?.content || '');
        document.title = `${data?.title || ''} - 编辑`;
        addDefaultTitleIfMissing(data?.title, data?.content);
        setCurrObj(data);
      } else {
        document.title = '新文章';
        const data = {
          content: '',
          category: '未分类'
        }
        addDefaultTitleIfMissing('无标题', '');
        setCurrObj(data);
      }

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

  const addDefaultTitleIfMissing = (title, content) => {

    if (title === null || title === undefined || title.trim() === '') {
      title = "无标题";
    }

    // 检查内容是否为 null、undefined 或空字符串
    if (content === null || content === undefined || content.trim() === '') {
      setValue(`<!-- ${title} -->\n\n` + (content || ''))
      return;
    }

    // 去掉内容开头的空白字符，然后匹配第一个 <!-- --> 之间的内容
    const trimmedContent = content.trimStart();
    const match = trimmedContent.match(/^<!--(.*?)-->/);

    if (!match) {
      setValue(`<!-- ${title} -->\n\n` + (content || ''))
    } else {
      setValue(content);
    }
  }


  const extractTitle = () => {
    // 检查内容是否为 null、undefined 或空字符串
    if (value === null || value === undefined || value.trim() === '') {
      return '无标题';
    }

    // 去掉内容开头的空白字符，然后匹配第一个 <!-- --> 之间的内容
    const trimmedContent = value.trimStart();
    const match = trimmedContent.match(/^<!--(.*?)-->/);

    // 如果匹配到符合的注释内容，则提取并返回注释中的内容，否则返回 "无标题"
    if (match !== null) {
      const title = match[1].trim();
      return title !== '' ? title : '无标题';
    } else {
      return '无标题';
    }
  }

  const replaceMathFormulaMark = () => {
    // Replace \( with $
    let result = value.replace(/\\\(/g, '$');

    // Replace \) with $
    result = result.replace(/\\\)/g, '$');

    // Replace \[ with $$
    result = result.replace(/\\\[/g, '$$$$');

    // Replace \] with $$
    result = result.replace(/\\]/g, '$$$$');
    setValue(result);
    return result;
  }

  const saveFn = async () => {
    const data = {}
    data.content = replaceMathFormulaMark()
    data.title = extractTitle();
    setLoading(true);
    if (type === 'article') {

      if (history.location.query.id) {
        await updateArticle(currObj?.id, data);
        await fetchData();
      } else {
        const results = await createArticle(data);
        const {location} = history;
        const {search} = location;
        if (search === '') {
          history.push({
            pathname: location.pathname,
            search: 'id=' + results.data.id
          });
        } else {
          history.push({
            pathname: location.pathname,
            search: search + '&id=' + results.data.id
          });
        }

        await fetchData();
      }
      // 保存成功
      setModifyButNotSave(false);
      message.success('保存成功！');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    await saveFn()
  };

  const viewArticle = () => {
    if (history.location.query?.id) {
      window.open(`/post/${getPathname(currObj)}`, '_blank');
    } else {
      alert("还未保存呢");
    }
  };

  const editorRef = useRef(null);

  // 定义要在按下 Ctrl + D 时执行的方法
  const handleCtrlD = () => {
    console.log('Ctrl + D pressed');
    // 在这里调用你希望在按下 Ctrl + D 时执行的组件方法
  };

  // 确保在组件挂载后获取 editor 实例
  useEffect(() => {
    if (editorRef.current) {
      const { editor } = editorRef.current;
      // 在 editor 实例上设置自定义的快捷键绑定
      editor.on('keydown', (cm, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
          // event.preventDefault();
          handleCtrlD();
        }
      });
    }
  }, [editorRef]);

  return (
    <div className="editor-full" style={{overflow: 'hidden'}}>
      <div style={{height: '100%'}}>
        <div style={{height: '0'}}>
          <Upload
            showUploadList={false}
            multiple={false}
            accept={'.md'}
            style={{display: 'none', height: 0}}
          >
            <a key="importBtn" type="link" style={{display: 'none'}} id="importBtn">
              导入内容
            </a>
          </Upload>
        </div>
        <Editor
          loading={loading}
          setLoading={setLoading}
          value={value}
          ref={editorRef}
          onChange={(val) => {
            setValue(val);
            // 修改了但是没有编辑
            setModifyButNotSave(true);
          }}
        />
      </div>
    </div>
  );
}
