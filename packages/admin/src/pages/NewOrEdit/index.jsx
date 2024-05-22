import Editor from '@/components/Editor';
import {createArticle, getArticleById, updateArticle,} from '@/services/van-blog/api';
import {getPathname} from '@/services/van-blog/getPathname';
import {message, Upload} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {history} from 'umi';


export default function () {
  const [value, setValue] = useState('');
  const [currObj, setCurrObj] = useState({});
  const [loading, setLoading] = useState(true);
  const type = history.location.query?.type || 'article';


  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
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

  const getTitle = () => {

    // 按行分割
    const lines = value.split('\n');

    // 查找第一个以 # 开头的标题
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#')) {
        // 去掉前缀的 #
        let title = line.replace(/^#+\s*/, '');

        // 如果内容为空，返回 "无标题"
        if (!title) {
          return "无标题";
        }

        // 截取最多 20 个字符
        if (title.length > 20) {
          title = title.slice(0, 20);
        }
        return title;
      }
    }

    // 如果没有找到任何标题，返回 "无标题"
    return "无标题";
  }

  const saveFn = async () => {

    const data = {}
    data.content = value;
    data.title = getTitle();
    setLoading(true);
    if (type === 'article') {

      if (history.location.query.id) {
        await updateArticle(currObj?.id, data);
        await fetchData();
      } else {
        const results = await createArticle(data)

        console.log(results)
        // data.id = results.data.id


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
          onChange={(val) => {
            setValue(val);
          }}
        />
      </div>
    </div>
  );
}
