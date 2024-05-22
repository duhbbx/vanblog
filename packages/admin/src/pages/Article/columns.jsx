import ColumnsToolBar from '@/components/ColumnsToolBar';
import UpdateModal from '@/components/UpdateModal';
import { deleteArticle, getAllCategories, getArticleById, getTags } from '@/services/van-blog/api';
import { getPathname } from '@/services/van-blog/getPathname';
import { parseObjToMarkdown } from '@/services/van-blog/parseMarkdownFile';
import { message, Modal, Space, Tag } from 'antd';
import { history } from 'umi';
import { genActiveObj } from '../../services/van-blog/activeColTools';
export const columns = [
  {
    dataIndex: 'id',
    valueType: 'number',
    title: 'ID',
    width: 48,
    search: false,
    editable: false,
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: 400,
    copyable: true,
    ellipsis: true,
    editable: true,
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: '创建时间',
    key: 'showTime',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
    width: 150,
    editable: true,
  },
  // {
  //   title: '顶置',
  //   key: 'top',
  //   dataIndex: 'top',
  //   valueType: 'number',
  //   sorter: true,
  //   width: 80,
  //   hideInSearch: true,
  // },
  // {
  //   title: '浏览量',
  //   key: 'viewer',
  //   dataIndex: 'viewer',
  //   valueType: 'number',
  //   sorter: true,
  //   width: 80,
  //   hideInSearch: true,
  //   editable: false,
  // },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    width: 120,
    render: (text, record, _, action) => {
      return (
        <Space>
          <ColumnsToolBar
            outs={[

              <a
                key={'inline-edit' + record.id}
                onClick={() => {
                  action?.startEditable?.(record.id);
                }}
              >
                行内编辑
              </a>,

              <a
                key={'editable' + record.id}
                onClick={() => {
                  history.push(
                    `/new-or-edit?type=${record?.about ? 'about' : 'article'}&id=${record.id}`,
                  );
                }}
              >
                编辑
              </a>,


              <a
                key={'deleteArticle' + record.id}
                onClick={() => {
                  Modal.confirm({
                    title: `确定删除 "${record.title}"吗？`,
                    onOk: async () => {
                      await deleteArticle(record.id);
                      message.success('删除成功!');
                      action?.reload();
                    },
                  });
                }}
              >
                删除
              </a>,

              <a
                href={`/post/${getPathname(record)}`}
                onClick={(ev) => {
                  if (record?.hidden) {
                    Modal.confirm({
                      title: '此文章为隐藏文章！',
                      content: (
                        <div>
                          <p>
                            隐藏文章在未开启通过 URL 访问的情况下（默认关闭），会出现 404 页面！
                          </p>
                          <p>
                            您可以在{' '}
                            <a
                              onClick={() => {
                                history.push('/site/setting?subTab=layout');
                              }}
                            >
                              布局配置
                            </a>{' '}
                            中修改此项。
                          </p>
                        </div>
                      ),
                      onOk: () => {
                        window.open(`/post/${getPathname(record)}`, '_blank');
                        return true;
                      },
                      okText: '仍然访问',
                      cancelText: '返回',
                    });
                    ev.preventDefault();
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                key={'view' + record.id}
              >
                查看
              </a>,
            ]}

            nodes={[]}
          /*
          nodes={[
            <UpdateModal
              currObj={record}
              setLoading={() => {}}
              type="article"
              onFinish={() => {
                action?.reload();
              }}
            />,
            <a
              key={'exportArticle' + record.id}
              onClick={async () => {
                const { data: obj } = await getArticleById(record.id);
                const md = parseObjToMarkdown(obj);
                const data = new Blob([md]);
                const url = URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${record.title}.md`;
                link.click();
              }}
            >
              导出
            </a>,
            <a
              key={'deleteArticle' + record.id}
              onClick={() => {
                Modal.confirm({
                  title: `确定删除 "${record.title}"吗？`,
                  onOk: async () => {
                    if (location.hostname == 'blog-demo.mereith.com') {
                      if ([28, 29].includes(record.id)) {
                        message.warn('演示站禁止删除此文章！');
                        return false;
                      }
                    }
                    await deleteArticle(record.id);
                    message.success('删除成功!');
                    action?.reload();
                  },
                });
              }}
            >
              删除
            </a>,
          ]}
          */
          />
        </Space>
      );
    },
  },
];
export const articleKeys = [
  'category',
  'id',
  'option',
  'showTime',
  'tags',
  'title',
  'top',
  'viewer',
];
export const articleKeysSmall = ['category', 'id', 'option', 'title'];
export const articleObjAll = genActiveObj(articleKeys, articleKeys);
export const articleObjSmall = genActiveObj(articleKeysSmall, articleKeys);
